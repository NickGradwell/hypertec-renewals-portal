// Shared types for the Hypertec Renewals Platform

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  role: UserRole;
  loginTime?: string;
}

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  resellerEmail?: string;
}

export interface Record {
  id: string;
  recordType: RecordType;
  customerName: string;
  partnerName?: string;
  partcode: string;
  serial?: string;
  renewalDue: string;
  status: RecordStatus;
  licenses: number;
  dateOfOrder: string;
  dateOfIssue: string;
  helReference: string;
  resellerOrderNum?: string;
  endUserRef: string;
  renewalEnabled: boolean;
  instructions: string;
  // Voucher-specific fields
  voucherCodes?: string[];
  claimedCount?: number;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  status: EmailStatus;
  templateUsed: string;
  body: string;
}

export interface EmailTemplate {
  id: string;
  enabled: boolean;
  subject: string;
  body: string;
}

// Enums
export enum UserRole {
  ADMIN = "Hypertec Admin",
  PARTNER = "Partner",
  CUSTOMER = "Customer"
}

export enum CompanyType {
  PARTNER = "Partner",
  CUSTOMER = "Customer",
  ADMIN = "Admin"
}

export enum RecordType {
  SOFTWARE = "Software License",
  VOUCHER = "Service Voucher"
}

export enum RecordStatus {
  ACTIVE = "Active",
  EXPIRING_SOON = "Expiring Soon",
  EXPIRED = "Expired"
}

export enum EmailStatus {
  SENT = "Sent",
  FAILED = "Failed",
  PENDING = "Pending"
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface UserFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface CompanyFormData {
  id?: string;
  name: string;
  type: CompanyType;
  resellerEmail?: string;
}

export interface RecordFormData {
  id?: string;
  recordType: RecordType;
  customerName: string;
  partnerName?: string;
  partcode: string;
  serial?: string;
  renewalDue: string;
  status: RecordStatus;
  licenses: number;
  dateOfOrder: string;
  dateOfIssue: string;
  helReference: string;
  resellerOrderNum?: string;
  endUserRef: string;
  renewalEnabled: boolean;
  instructions: string;
  voucherCodes?: string[];
  claimedCount?: number;
}
