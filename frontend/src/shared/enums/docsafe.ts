export const DocumentStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRING_SOON: 'EXPIRING_SOON',
  EXPIRED: 'EXPIRED',
  RENEWAL_IN_PROGRESS: 'RENEWAL_IN_PROGRESS',
  ARCHIVED: 'ARCHIVED',
  MISSING: 'MISSING'
} as const;
export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];

export const ComplianceStatus = {
  COMPLIANT: 'COMPLIANT',
  PENDING: 'PENDING',
  MISSING: 'MISSING',
  EXPIRED: 'EXPIRED',
  UNDER_REVIEW: 'UNDER_REVIEW'
} as const;
export type ComplianceStatus = typeof ComplianceStatus[keyof typeof ComplianceStatus];

export const RenewalStatus = {
  NOT_STARTED: 'NOT_STARTED',
  INITIATED: 'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
} as const;
export type RenewalStatus = typeof RenewalStatus[keyof typeof RenewalStatus];

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export const UserRole = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Org Admin',
  COMPLIANCE_MANAGER: 'Compliance Manager',
  UPLOADER: 'Uploader',
  REVIEWER: 'Reviewer',
  VIEWER: 'Viewer'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];
