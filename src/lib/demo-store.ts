import { randomBytes, randomUUID } from "crypto";
import type {
  AppRole,
  Business,
  BusinessUser,
  Discount,
  Profile,
  QrToken,
  Redemption,
  SessionUser,
  StudentApplication,
  StudentRecord,
} from "@/lib/types";

const now = () => new Date().toISOString();

type DemoAccount = {
  password: string;
  profile: Profile;
};

function profile(
  id: string,
  role: AppRole,
  firstName: string,
  lastName: string,
  email: string,
  avatarUrl: string | null = null,
): Profile {
  return {
    id,
    role,
    firstName,
    lastName,
    phone: null,
    email,
    avatarUrl,
    createdAt: now(),
  };
}

const accounts: DemoAccount[] = [];

const applications: StudentApplication[] = [];

const students: StudentRecord[] = [];

const businesses: Business[] = [];

const businessUsers: BusinessUser[] = [];

const discounts: Discount[] = [];

const qrTokens: QrToken[] = [];

const redemptions: Redemption[] = [];

type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

const auditLogs: AuditLog[] = [];

function membershipNumber() {
  let n = "";
  do {
    n = `SGK-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0")}`;
  } while (students.some((s) => s.membershipNumber === n));
  return n;
}

export const demoStore = {
  accounts,
  applications,
  students,
  businesses,
  businessUsers,
  discounts,
  qrTokens,
  redemptions,
  auditLogs,

  findAccountByEmail(email: string) {
    return accounts.find((a) => a.profile.email.toLowerCase() === email.toLowerCase());
  },

  findProfile(id: string) {
    return accounts.find((a) => a.profile.id === id)?.profile ?? null;
  },

  sessionFromId(id: string): SessionUser | null {
    const p = this.findProfile(id);
    if (!p) return null;
    return {
      id: p.id,
      email: p.email,
      role: p.role,
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUrl: p.avatarUrl,
    };
  },

  registerStudent(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    if (this.findAccountByEmail(input.email)) {
      throw new Error("Bu e-posta adresi zaten kayıtlı.");
    }
    const id = randomUUID();
    const profileRow = profile(
      id,
      "student",
      input.firstName,
      input.lastName,
      input.email,
    );
    accounts.push({ password: input.password, profile: profileRow });
    return profileRow;
  },

  upsertApplication(
    userId: string,
    input: {
      university: string;
      studentNumber: string;
      department: string;
      documentName: string | null;
    },
  ) {
    const existing = applications.find(
      (a) => a.userId === userId && a.status !== "approved",
    );
    if (existing) {
      existing.university = input.university;
      existing.studentNumber = input.studentNumber;
      existing.department = input.department;
      existing.documentName = input.documentName;
      existing.status = "pending";
      existing.notes = null;
      return existing;
    }
    const row: StudentApplication = {
      id: randomUUID(),
      userId,
      university: input.university,
      studentNumber: input.studentNumber,
      department: input.department,
      documentName: input.documentName,
      status: "pending",
      notes: null,
      createdAt: now(),
      reviewedAt: null,
    };
    applications.push(row);
    return row;
  },

  reviewApplication(id: string, decision: "approved" | "rejected", actorId: string, notes: string | null) {
    const app = applications.find((a) => a.id === id);
    if (!app) throw new Error("Başvuru bulunamadı.");
    app.status = decision;
    app.reviewedAt = now();
    app.notes = notes;
    if (decision === "approved") {
      const already = students.find((s) => s.userId === app.userId);
      if (!already) {
        students.push({
          id: randomUUID(),
          userId: app.userId,
          membershipNumber: membershipNumber(),
          university: app.university,
          department: app.department,
          status: "active",
          validFrom: new Date().toISOString().slice(0, 10),
          validUntil: "2027-09-01",
        });
      }
    }
    auditLogs.push({
      id: randomUUID(),
      actorId,
      action: decision === "approved" ? "application.approve" : "application.reject",
      entity: "student_applications",
      entityId: id,
      metadata: { notes },
      createdAt: now(),
    });
    return app;
  },

  studentForUser(userId: string) {
    return students.find((s) => s.userId === userId) ?? null;
  },

  applicationForUser(userId: string) {
    return (
      applications
        .filter((a) => a.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    );
  },

  businessForUser(userId: string) {
    const link = businessUsers.find((b) => b.userId === userId);
    if (!link) return null;
    return businesses.find((b) => b.id === link.businessId) ?? null;
  },

  businessUserForUser(userId: string) {
    return businessUsers.find((b) => b.userId === userId) ?? null;
  },

  activeDiscount(businessId: string) {
    return (
      discounts
        .filter((d) => d.businessId === businessId && d.isActive)
        .sort((a, b) => b.percentage - a.percentage)[0] ?? null
    );
  },

  issueQr(studentId: string, ttlSeconds: number) {
    const token = randomBytes(24).toString("base64url");
    const row: QrToken = {
      id: randomUUID(),
      studentId,
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      usedAt: null,
    };
    qrTokens.push(row);
    return row;
  },

  findLiveToken(token: string) {
    return (
      qrTokens.find(
        (t) =>
          t.token === token &&
          !t.usedAt &&
          new Date(t.expiresAt).getTime() > Date.now(),
      ) ?? null
    );
  },

  updateProfile(userId: string, patch: { firstName?: string; lastName?: string; phone?: string | null }) {
    const acc = accounts.find((a) => a.profile.id === userId);
    if (!acc) throw new Error("Profil bulunamadı.");
    if (patch.firstName !== undefined) acc.profile.firstName = patch.firstName;
    if (patch.lastName !== undefined) acc.profile.lastName = patch.lastName;
    if (patch.phone !== undefined) acc.profile.phone = patch.phone;
    return acc.profile;
  },

  addBusiness(input: { name: string; category: string; address: string; city: string }) {
    const row: Business = {
      id: randomUUID(),
      name: input.name,
      category: input.category,
      address: input.address,
      city: input.city,
      isActive: true,
    };
    businesses.push(row);
    return row;
  },

  addBusinessUser(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessId: string;
    role: "owner" | "staff";
  }) {
    if (this.findAccountByEmail(input.email)) {
      throw new Error("Bu e-posta adresi zaten kayıtlı.");
    }
    const id = randomUUID();
    const p = profile(id, "business", input.firstName, input.lastName, input.email);
    accounts.push({ password: input.password, profile: p });
    const link: BusinessUser = {
      id: randomUUID(),
      businessId: input.businessId,
      userId: id,
      role: input.role,
    };
    businessUsers.push(link);
    return { profile: p, link };
  },

  addDiscount(input: {
    businessId: string;
    percentage: number;
    description: string;
  }) {
    const row: Discount = {
      id: randomUUID(),
      businessId: input.businessId,
      percentage: input.percentage,
      description: input.description,
      isActive: true,
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: "2027-12-31",
    };
    discounts.push(row);
    return row;
  },

  toggleDiscount(id: string) {
    const d = discounts.find((x) => x.id === id);
    if (!d) throw new Error("İndirim bulunamadı.");
    d.isActive = !d.isActive;
    return d;
  },

  toggleStudent(id: string) {
    const s = students.find((x) => x.id === id);
    if (!s) throw new Error("Öğrenci bulunamadı.");
    s.status = s.status === "active" ? "suspended" : "active";
    return s;
  },

  toggleBusiness(id: string) {
    const b = businesses.find((x) => x.id === id);
    if (!b) throw new Error("İşletme bulunamadı.");
    b.isActive = !b.isActive;
    return b;
  },
};

export const DEMO_LOGINS = [];
