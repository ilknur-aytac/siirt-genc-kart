export type AppRole = "student" | "business" | "admin";
export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";
export type StudentStatus = "active" | "expired" | "suspended";
export type BusinessUserRole = "owner" | "staff";

export type Profile = {
  id: string;
  role: AppRole;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type StudentApplication = {
  id: string;
  userId: string;
  university: string;
  studentNumber: string;
  department: string | null;
  documentName: string | null;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type StudentRecord = {
  id: string;
  userId: string;
  membershipNumber: string;
  university: string;
  department: string | null;
  status: StudentStatus;
  validFrom: string;
  validUntil: string;
};

export type Business = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  city: string;
  isActive: boolean;
};

export type BusinessUser = {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessUserRole;
};

export type Discount = {
  id: string;
  businessId: string;
  percentage: number;
  description: string | null;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
};

export type QrToken = {
  id: string;
  studentId: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
};

export type Redemption = {
  id: string;
  studentId: string;
  businessId: string;
  businessUserId: string | null;
  discountId: string | null;
  percentage: number;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  role: AppRole;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type QrPreview = {
  tokenId: string;
  firstName: string;
  lastName: string;
  university: string;
  avatarUrl: string | null;
  membershipValid: boolean;
  validUntil: string;
  discountPercentage: number | null;
  discountId: string | null;
};
