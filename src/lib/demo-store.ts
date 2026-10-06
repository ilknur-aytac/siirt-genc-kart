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

const IDS = {
  admin: "11111111-1111-4111-8111-111111111111",
  student: "22222222-2222-4222-8222-222222222222",
  studentPending: "33333333-3333-4333-8333-333333333333",
  business: "44444444-4444-4444-8444-444444444444",
  cafe: "55555555-5555-4555-8555-555555555555",
  restaurant: "66666666-6666-4666-8666-666666666666",
  bookstore: "77777777-7777-4777-8777-777777777777",
  studentRecord: "88888888-8888-4888-8888-888888888888",
  appApproved: "99999999-9999-4999-8999-999999999999",
  appPending: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  buCafe: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  discCafe: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  discRest: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  discBook: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  red1: "ffffffff-ffff-4fff-8fff-ffffffffffff",
};

const AVATAR_ELIF =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="#0c2340" width="80" height="80"/><circle cx="40" cy="30" r="14" fill="#f6e7c8"/><ellipse cx="40" cy="66" rx="22" ry="18" fill="#c9a227"/></svg>`,
  );

const accounts: DemoAccount[] = [
  {
    password: "demo123",
    profile: profile(IDS.admin, "admin", "Ayşe", "Demir", "admin@siirtgenckart.demo"),
  },
  {
    password: "demo123",
    profile: profile(
      IDS.student,
      "student",
      "Elif",
      "Yılmaz",
      "ogrenci@siirtgenckart.demo",
      AVATAR_ELIF,
    ),
  },
  {
    password: "demo123",
    profile: profile(
      IDS.studentPending,
      "student",
      "Mert",
      "Kaya",
      "basvuru@siirtgenckart.demo",
    ),
  },
  {
    password: "demo123",
    profile: profile(
      IDS.business,
      "business",
      "Can",
      "Öztürk",
      "isletme@siirtgenckart.demo",
    ),
  },
];

const applications: StudentApplication[] = [
  {
    id: IDS.appApproved,
    userId: IDS.student,
    university: "Ankara Üniversitesi",
    studentNumber: "21450123",
    department: "Bilgisayar Mühendisliği",
    documentName: "ogrenci-belgesi.pdf",
    status: "approved",
    notes: null,
    createdAt: now(),
    reviewedAt: now(),
  },
  {
    id: IDS.appPending,
    userId: IDS.studentPending,
    university: "Hacettepe Üniversitesi",
    studentNumber: "22098765",
    department: "İşletme",
    documentName: "ogrenci-belgesi.pdf",
    status: "pending",
    notes: null,
    createdAt: now(),
    reviewedAt: null,
  },
];

const students: StudentRecord[] = [
  {
    id: IDS.studentRecord,
    userId: IDS.student,
    membershipNumber: "SGK-184392",
    university: "Ankara Üniversitesi",
    department: "Bilgisayar Mühendisliği",
    status: "active",
    validFrom: "2026-09-01",
    validUntil: "2027-09-01",
  },
];

const businesses: Business[] = [
  {
    id: IDS.cafe,
    name: "Kampüs Kahve Ankara",
    category: "kafe",
    address: "Kızılay, Çankaya",
    city: "Ankara",
    isActive: true,
  },
  {
    id: IDS.restaurant,
    name: "Siirt Tadım Sofrası",
    category: "restoran",
    address: "Bahçelievler",
    city: "Ankara",
    isActive: true,
  },
  {
    id: IDS.bookstore,
    name: "Merkez Kitabevi",
    category: "kitabevi",
    address: "Tunalı Hilmi",
    city: "Ankara",
    isActive: true,
  },
];

const businessUsers: BusinessUser[] = [
  {
    id: IDS.buCafe,
    businessId: IDS.cafe,
    userId: IDS.business,
    role: "owner",
  },
];

const discounts: Discount[] = [
  {
    id: IDS.discCafe,
    businessId: IDS.cafe,
    percentage: 20,
    description: "Tüm içeceklerde öğrenci indirimi",
    isActive: true,
    validFrom: "2026-01-01",
    validUntil: "2027-12-31",
  },
  {
    id: IDS.discRest,
    businessId: IDS.restaurant,
    percentage: 15,
    description: "Ana yemeklerde geçerli",
    isActive: true,
    validFrom: "2026-01-01",
    validUntil: "2027-12-31",
  },
  {
    id: IDS.discBook,
    businessId: IDS.bookstore,
    percentage: 10,
    description: "Ders kitaplarında geçerli",
    isActive: true,
    validFrom: "2026-01-01",
    validUntil: "2027-12-31",
  },
];

const qrTokens: QrToken[] = [];

const redemptions: Redemption[] = [
  {
    id: IDS.red1,
    studentId: IDS.studentRecord,
    businessId: IDS.restaurant,
    businessUserId: null,
    discountId: IDS.discRest,
    percentage: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

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

export const DEMO_LOGINS = [
  {
    role: "student" as const,
    email: "ogrenci@siirtgenckart.demo",
    password: "demo123",
    label: "Öğrenci hesabı",
  },
  {
    role: "business" as const,
    email: "isletme@siirtgenckart.demo",
    password: "demo123",
    label: "İşletme hesabı",
  },
  {
    role: "admin" as const,
    email: "admin@siirtgenckart.demo",
    password: "demo123",
    label: "Yönetici hesabı",
  },
];
