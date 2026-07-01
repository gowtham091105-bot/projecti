import { DocumentStatus, ComplianceStatus, RenewalStatus, Severity } from '../shared/enums/docsafe';

// Interfaces for our database entities
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  tenantId: string;
  categoryId: string;
  title: string;
  description?: string;
  fileAssetId: string | null;
  fileName: string | null;
  fileSize: string | null; // e.g. "2.4 MB"
  ownerUserId: string;
  issueDate: string;
  expiryDate: string;
  renewalDueDate?: string;
  status: DocumentStatus;
  visibilityScope?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: string;
  tenantId: string;
  name: string;
  categoryId: string | null;
  linkedDocumentId: string | null;
  dueDate: string | null;
  severity: Severity;
  status: ComplianceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalRecord {
  id: string;
  tenantId: string;
  documentId: string;
  initiatedBy: string;
  initiatedAt: string;
  stage: string;
  remarks?: string;
  completedAt: string | null;
  status: RenewalStatus;
}

export interface DocumentEvent {
  id: string;
  tenantId: string;
  documentId: string | null;
  eventType: string;
  payloadJson: string | null;
  triggeredBy: string;
  triggeredAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
}

// Generate unique IDs
export const generateUUID = (): string => {
  return 'uuid_' + Math.random().toString(36).substr(2, 9);
};

// Default static lists
export const TENANTS: Tenant[] = [
  { id: 'tenant_acme', name: 'Acme Corporation', domain: 'acme.com' },
  { id: 'tenant_stark', name: 'Stark Industries', domain: 'stark.com' }
];

export const USERS: User[] = [
  { id: 'usr_acme_admin', tenantId: 'tenant_acme', name: 'Tony Stark (Acme)', email: 'admin@acme.com', role: 'Org Admin' },
  { id: 'usr_acme_mgr', tenantId: 'tenant_acme', name: 'Bruce Banner (Acme)', email: 'manager@acme.com', role: 'Compliance Manager' },
  { id: 'usr_acme_viewer', tenantId: 'tenant_acme', name: 'Peter Parker (Acme)', email: 'viewer@acme.com', role: 'Viewer' },
  
  { id: 'usr_stark_admin', tenantId: 'tenant_stark', name: 'Pepper Potts (Stark)', email: 'admin@stark.com', role: 'Org Admin' },
  { id: 'usr_stark_uploader', tenantId: 'tenant_stark', name: 'Happy Hogan (Stark)', email: 'uploader@stark.com', role: 'Uploader' },
  { id: 'usr_stark_reviewer', tenantId: 'tenant_stark', name: 'Rhodey (Stark)', email: 'reviewer@stark.com', role: 'Reviewer' }
];

// Helper to check local storage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key:', key, error);
  }
};

// SEED DATA
const seedDatabase = () => {
  // 1. Categories seed
  const categories: Category[] = [
    // Acme Categories
    { id: 'cat_acme_lic', tenantId: 'tenant_acme', name: 'License', description: 'Government and trade licenses', isActive: true, createdBy: 'usr_acme_admin', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-01-15T08:00:00Z' },
    { id: 'cat_acme_tax', tenantId: 'tenant_acme', name: 'Tax', description: 'Tax clearances and filings', isActive: true, createdBy: 'usr_acme_admin', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-01-15T08:00:00Z' },
    { id: 'cat_acme_ins', tenantId: 'tenant_acme', name: 'Insurance', description: 'Liability and property insurance policy', isActive: true, createdBy: 'usr_acme_admin', createdAt: '2026-01-16T09:00:00Z', updatedAt: '2026-01-16T09:00:00Z' },
    { id: 'cat_acme_agr', tenantId: 'tenant_acme', name: 'Agreement', description: 'NDAs and service agreements', isActive: true, createdBy: 'usr_acme_admin', createdAt: '2026-01-16T09:00:00Z', updatedAt: '2026-01-16T09:00:00Z' },
    
    // Stark Categories
    { id: 'cat_stark_lic', tenantId: 'tenant_stark', name: 'License', description: 'Tech manufacturing and defense licenses', isActive: true, createdBy: 'usr_stark_admin', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-01-15T08:00:00Z' },
    { id: 'cat_stark_ins', tenantId: 'tenant_stark', name: 'Insurance', description: 'Stark facility policies', isActive: true, createdBy: 'usr_stark_admin', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-01-15T08:00:00Z' }
  ];

  // 2. Documents seed
  const documents: DocumentRecord[] = [
    // Acme Documents
    {
      id: 'doc_acme_001',
      tenantId: 'tenant_acme',
      categoryId: 'cat_acme_lic',
      title: 'Commercial Trade License 2026',
      description: 'Primary trade license for Chennai corporate office',
      fileAssetId: 'asset_acme_001',
      fileName: 'trade_license_2026.pdf',
      fileSize: '1.8 MB',
      ownerUserId: 'usr_acme_admin',
      issueDate: '2026-01-01',
      expiryDate: '2027-01-01',
      renewalDueDate: '2026-12-01',
      status: DocumentStatus.ACTIVE,
      visibilityScope: 'Global',
      uploadedBy: 'usr_acme_admin',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z'
    },
    {
      id: 'doc_acme_002',
      tenantId: 'tenant_acme',
      categoryId: 'cat_acme_tax',
      title: 'Corporate Tax Assessment Q1',
      description: 'Q1 2026 verified tax clearance documentation',
      fileAssetId: 'asset_acme_002',
      fileName: 'tax_clearance_q1.pdf',
      fileSize: '4.2 MB',
      ownerUserId: 'usr_acme_mgr',
      issueDate: '2026-02-10',
      expiryDate: '2026-06-30', // Expiring soon relative to June 12, 2026
      renewalDueDate: '2026-06-15',
      status: DocumentStatus.EXPIRING_SOON,
      visibilityScope: 'Finance Team',
      uploadedBy: 'usr_acme_mgr',
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-02-10T11:00:00Z'
    },
    {
      id: 'doc_acme_003',
      tenantId: 'tenant_acme',
      categoryId: 'cat_acme_ins',
      title: 'Facility Fire Insurance Policy',
      description: 'Expired safety insurance documentation. Renewal required.',
      fileAssetId: 'asset_acme_003',
      fileName: 'fire_insurance_25.pdf',
      fileSize: '3.1 MB',
      ownerUserId: 'usr_acme_admin',
      issueDate: '2025-05-01',
      expiryDate: '2026-05-01', // Already expired as of June 2026
      renewalDueDate: '2026-04-15',
      status: DocumentStatus.EXPIRED,
      visibilityScope: 'HR & Admin',
      uploadedBy: 'usr_acme_admin',
      createdAt: '2025-05-01T09:00:00Z',
      updatedAt: '2026-05-02T10:00:00Z'
    },
    {
      id: 'doc_acme_004',
      tenantId: 'tenant_acme',
      categoryId: 'cat_acme_agr',
      title: 'Vendor SLA Agreement - Microsoft',
      description: 'Azure hosting service level agreement renewal process initiated.',
      fileAssetId: 'asset_acme_004',
      fileName: 'microsoft_sla.pdf',
      fileSize: '2.9 MB',
      ownerUserId: 'usr_acme_mgr',
      issueDate: '2025-06-12',
      expiryDate: '2026-06-12', // Expired today!
      renewalDueDate: '2026-05-12',
      status: DocumentStatus.RENEWAL_IN_PROGRESS,
      visibilityScope: 'IT Infrastructure',
      uploadedBy: 'usr_acme_mgr',
      createdAt: '2025-06-12T14:00:00Z',
      updatedAt: '2026-05-15T10:00:00Z'
    },
    {
      id: 'doc_acme_005',
      tenantId: 'tenant_acme',
      categoryId: 'cat_acme_lic',
      title: 'NDT Compliance Certification',
      description: 'Missing actual physical document scan, marked as Missing.',
      fileAssetId: null,
      fileName: null,
      fileSize: null,
      ownerUserId: 'usr_acme_mgr',
      issueDate: '2026-03-01',
      expiryDate: '2027-03-01',
      renewalDueDate: '2027-02-01',
      status: DocumentStatus.MISSING,
      visibilityScope: 'Compliance Committee',
      uploadedBy: 'usr_acme_mgr',
      createdAt: '2026-03-01T15:00:00Z',
      updatedAt: '2026-03-01T15:00:00Z'
    },

    // Stark Documents
    {
      id: 'doc_stark_001',
      tenantId: 'tenant_stark',
      categoryId: 'cat_stark_lic',
      title: 'Arc Reactor Tech Import Permit',
      description: 'Federal approval for import of heavy core palladium parts',
      fileAssetId: 'asset_stark_001',
      fileName: 'arc_import_permit.pdf',
      fileSize: '5.4 MB',
      ownerUserId: 'usr_stark_admin',
      issueDate: '2026-02-01',
      expiryDate: '2027-02-01',
      renewalDueDate: '2027-01-01',
      status: DocumentStatus.ACTIVE,
      visibilityScope: 'Executive Circle',
      uploadedBy: 'usr_stark_admin',
      createdAt: '2026-02-01T11:00:00Z',
      updatedAt: '2026-02-01T11:00:00Z'
    }
  ];

  // 3. Compliance Items seed
  const compliance: ComplianceItem[] = [
    // Acme Compliance Items
    {
      id: 'comp_acme_001',
      tenantId: 'tenant_acme',
      name: 'Annual Trade License Verification',
      categoryId: 'cat_acme_lic',
      linkedDocumentId: 'doc_acme_001',
      dueDate: '2026-12-15',
      severity: Severity.HIGH,
      status: ComplianceStatus.COMPLIANT,
      notes: 'Ensure Trade License remains active. Verify with Municipal Corporation.',
      createdAt: '2026-01-15T10:10:00Z',
      updatedAt: '2026-01-15T10:15:00Z'
    },
    {
      id: 'comp_acme_002',
      tenantId: 'tenant_acme',
      name: 'Q1 Corporate Tax Filing',
      categoryId: 'cat_acme_tax',
      linkedDocumentId: 'doc_acme_002',
      dueDate: '2026-06-30',
      severity: Severity.MEDIUM,
      status: ComplianceStatus.UNDER_REVIEW,
      notes: 'Final tax invoice validation by finance desk prior to closure.',
      createdAt: '2026-02-10T11:15:00Z',
      updatedAt: '2026-06-10T12:00:00Z'
    },
    {
      id: 'comp_acme_003',
      tenantId: 'tenant_acme',
      name: 'Facility Fire Safety Audit',
      categoryId: 'cat_acme_ins',
      linkedDocumentId: 'doc_acme_003',
      dueDate: '2026-05-01',
      severity: Severity.HIGH,
      status: ComplianceStatus.EXPIRED,
      notes: 'Immediate hazard warning: policy has lapsed and fire audit is overdue!',
      createdAt: '2025-05-01T09:30:00Z',
      updatedAt: '2026-05-02T10:05:00Z'
    },
    {
      id: 'comp_acme_004',
      tenantId: 'tenant_acme',
      name: 'Microsoft SLA Renewal Review',
      categoryId: 'cat_acme_agr',
      linkedDocumentId: 'doc_acme_004',
      dueDate: '2026-06-12',
      severity: Severity.MEDIUM,
      status: ComplianceStatus.PENDING,
      notes: 'Review licensing tier and verify user counts before final sign-off.',
      createdAt: '2025-06-12T14:15:00Z',
      updatedAt: '2026-05-15T10:10:00Z'
    },
    {
      id: 'comp_acme_005',
      tenantId: 'tenant_acme',
      name: 'NDT Structural Certification Filing',
      categoryId: 'cat_acme_lic',
      linkedDocumentId: 'doc_acme_005',
      dueDate: '2026-04-15',
      severity: Severity.HIGH,
      status: ComplianceStatus.MISSING,
      notes: 'No documentation uploaded for NDT testing of third-floor server deck.',
      createdAt: '2026-03-01T15:10:00Z',
      updatedAt: '2026-03-01T15:10:00Z'
    },

    // Stark Compliance Items
    {
      id: 'comp_stark_001',
      tenantId: 'tenant_stark',
      name: 'Palladium Core Safety Audit',
      categoryId: 'cat_stark_lic',
      linkedDocumentId: 'doc_stark_001',
      dueDate: '2026-11-20',
      severity: Severity.HIGH,
      status: ComplianceStatus.COMPLIANT,
      notes: 'Strict radiation and shield integrity inspection by J.A.R.V.I.S.',
      createdAt: '2026-02-01T11:15:00Z',
      updatedAt: '2026-02-01T11:20:00Z'
    }
  ];

  // 4. Renewal Records seed
  const renewals: RenewalRecord[] = [
    {
      id: 'ren_acme_001',
      tenantId: 'tenant_acme',
      documentId: 'doc_acme_004',
      initiatedBy: 'usr_acme_mgr',
      initiatedAt: '2026-05-15T10:00:00Z',
      stage: 'Quote Negotiation',
      remarks: 'Microsoft offered 5% volume discount. Awaiting finance confirmation.',
      completedAt: null,
      status: RenewalStatus.IN_PROGRESS
    }
  ];

  // 5. Document Events seed
  const events: DocumentEvent[] = [
    { id: 'evt_001', tenantId: 'tenant_acme', documentId: 'doc_acme_001', eventType: 'DOCUMENT_CREATE', payloadJson: JSON.stringify({ title: 'Commercial Trade License 2026' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: '2026-01-15T10:00:00Z' },
    { id: 'evt_002', tenantId: 'tenant_acme', documentId: 'doc_acme_001', eventType: 'FILE_UPLOAD', payloadJson: JSON.stringify({ fileName: 'trade_license_2026.pdf', size: '1.8 MB' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: '2026-01-15T10:05:00Z' },
    { id: 'evt_003', tenantId: 'tenant_acme', documentId: 'doc_acme_003', eventType: 'DOCUMENT_EXPIRED', payloadJson: JSON.stringify({ title: 'Facility Fire Insurance Policy', expiredAt: '2026-05-01' }), triggeredBy: 'System Cron', triggeredAt: '2026-05-01T23:59:59Z' },
    { id: 'evt_004', tenantId: 'tenant_acme', documentId: 'doc_acme_004', eventType: 'RENEWAL_INITIATED', payloadJson: JSON.stringify({ stage: 'Initiation', remarks: 'Azure SLA renewal project launched' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: '2026-05-15T10:00:00Z' },
    { id: 'evt_005', tenantId: 'tenant_acme', documentId: 'doc_acme_002', eventType: 'COMPLIANCE_STATUS_UPDATE', payloadJson: JSON.stringify({ from: 'PENDING', to: 'UNDER_REVIEW' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: '2026-06-10T12:00:00Z' }
  ];

  setStorageItem('docsafe_categories', categories);
  setStorageItem('docsafe_documents', documents);
  setStorageItem('docsafe_compliance_items', compliance);
  setStorageItem('docsafe_renewal_records', renewals);
  setStorageItem('docsafe_document_events', events);
  setStorageItem('docsafe_seeded', 'true');
};

// Seed db if not seeded yet
if (getStorageItem('docsafe_seeded', 'false') === 'false') {
  seedDatabase();
}

// DATABASE SERVICE
export const mockDb = {
  // --- GENERAL AUDIT LOGGING ---
  logEvent(tenantId: string, documentId: string | null, eventType: string, payload: any, userName: string) {
    const events = getStorageItem<DocumentEvent[]>('docsafe_document_events', []);
    const newEvent: DocumentEvent = {
      id: generateUUID(),
      tenantId,
      documentId,
      eventType,
      payloadJson: payload ? JSON.stringify(payload) : null,
      triggeredBy: userName,
      triggeredAt: new Date().toISOString()
    };
    events.unshift(newEvent); // Add to beginning of activities list
    setStorageItem('docsafe_document_events', events);
  },

  // --- CATEGORIES ---
  getCategories(tenantId: string): Category[] {
    const list = getStorageItem<Category[]>('docsafe_categories', []);
    return list.filter(item => item.tenantId === tenantId);
  },

  createCategory(tenantId: string, name: string, description: string, isActive: boolean, userId: string, userName: string): { success: boolean; message: string; data?: Category } {
    const list = getStorageItem<Category[]>('docsafe_categories', []);
    
    // Validate uniqueness within tenant
    const exists = list.some(item => item.tenantId === tenantId && item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return { success: false, message: `Category named "${name}" already exists for this tenant.` };
    }

    const newCat: Category = {
      id: generateUUID(),
      tenantId,
      name,
      description,
      isActive,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newCat);
    setStorageItem('docsafe_categories', list);

    this.logEvent(tenantId, null, 'CATEGORY_CREATE', { name, isActive }, userName);

    return { success: true, message: 'Category created successfully', data: newCat };
  },

  updateCategory(tenantId: string, id: string, name: string, description: string, isActive: boolean, userName: string): { success: boolean; message: string; data?: Category } {
    const list = getStorageItem<Category[]>('docsafe_categories', []);
    const index = list.findIndex(item => item.id === id && item.tenantId === tenantId);
    
    if (index === -1) {
      return { success: false, message: 'Category not found or access denied.' };
    }

    // Check name uniqueness if changed
    const nameConflict = list.some(item => item.tenantId === tenantId && item.id !== id && item.name.toLowerCase() === name.toLowerCase());
    if (nameConflict) {
      return { success: false, message: `Another category named "${name}" already exists.` };
    }

    const oldCat = list[index];
    const updated: Category = {
      ...oldCat,
      name,
      description,
      isActive,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    setStorageItem('docsafe_categories', list);

    this.logEvent(tenantId, null, 'CATEGORY_UPDATE', { id, name, oldActive: oldCat.isActive, newActive: isActive }, userName);

    return { success: true, message: 'Category updated successfully', data: updated };
  },

  deleteCategory(tenantId: string, id: string, userName: string): { success: boolean; message: string } {
    const list = getStorageItem<Category[]>('docsafe_categories', []);
    const index = list.findIndex(item => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return { success: false, message: 'Category not found or access denied.' };
    }

    // Check if category is used by any document
    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const inUse = docs.some(d => d.tenantId === tenantId && d.categoryId === id);
    if (inUse) {
      return { success: false, message: 'Category is currently in use by documents and cannot be deleted. Deactivate it instead.' };
    }

    const deleted = list.splice(index, 1)[0];
    setStorageItem('docsafe_categories', list);

    this.logEvent(tenantId, null, 'CATEGORY_DELETE', { id, name: deleted.name }, userName);
    return { success: true, message: 'Category deleted successfully' };
  },

  // --- DOCUMENTS ---
  getDocuments(tenantId: string): DocumentRecord[] {
    const list = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    return list.filter(item => item.tenantId === tenantId);
  },

  getDocumentById(tenantId: string, id: string): DocumentRecord | null {
    const list = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const doc = list.find(item => item.id === id && item.tenantId === tenantId);
    return doc || null;
  },

  createDocument(
    tenantId: string,
    data: {
      title: string;
      categoryId: string;
      description?: string;
      ownerUserId: string;
      issueDate: string;
      expiryDate: string;
      renewalDueDate?: string;
      visibilityScope?: string;
      fileName?: string;
      fileSize?: string;
    },
    userId: string,
    userName: string
  ): { success: boolean; message: string; data?: DocumentRecord } {
    // Basic date validations (Section 13)
    if (new Date(data.expiryDate) < new Date(data.issueDate)) {
      return { success: false, message: 'Expiry date must be greater than or equal to issue date.' };
    }

    if (data.renewalDueDate && new Date(data.renewalDueDate) > new Date(data.expiryDate)) {
      return { success: false, message: 'Renewal due date should not be later than expiry date.' };
    }

    // Tenant check on category references
    const cats = this.getCategories(tenantId);
    const catExists = cats.some(c => c.id === data.categoryId);
    if (!catExists) {
      return { success: false, message: 'Selected Category is invalid or belongs to another tenant.' };
    }

    // Determine status automatically based on dates if active
    let initialStatus: DocumentStatus = DocumentStatus.ACTIVE;
    const now = new Date();
    const expiry = new Date(data.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (expiry < now) {
      initialStatus = DocumentStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      initialStatus = DocumentStatus.EXPIRING_SOON;
    }

    const hasFile = !!data.fileName;

    const newDoc: DocumentRecord = {
      id: generateUUID(),
      tenantId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description || '',
      fileAssetId: hasFile ? generateUUID() : null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      ownerUserId: data.ownerUserId,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      renewalDueDate: data.renewalDueDate,
      status: hasFile ? initialStatus : DocumentStatus.MISSING, // If no file, mark as missing file
      visibilityScope: data.visibilityScope || 'Global',
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    docs.push(newDoc);
    setStorageItem('docsafe_documents', docs);

    this.logEvent(tenantId, newDoc.id, 'DOCUMENT_CREATE', { title: newDoc.title, categoryId: newDoc.categoryId }, userName);
    if (hasFile) {
      this.logEvent(tenantId, newDoc.id, 'FILE_UPLOAD', { fileName: newDoc.fileName, fileSize: newDoc.fileSize }, userName);
    }

    return { success: true, message: 'Document created successfully', data: newDoc };
  },

  updateDocument(
    tenantId: string,
    id: string,
    data: {
      title: string;
      categoryId: string;
      description?: string;
      ownerUserId: string;
      issueDate: string;
      expiryDate: string;
      renewalDueDate?: string;
      visibilityScope?: string;
      status?: DocumentStatus;
    },
    userName: string
  ): { success: boolean; message: string; data?: DocumentRecord } {
    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const index = docs.findIndex(item => item.id === id && item.tenantId === tenantId);
    
    if (index === -1) {
      return { success: false, message: 'Document not found or access denied.' };
    }

    if (new Date(data.expiryDate) < new Date(data.issueDate)) {
      return { success: false, message: 'Expiry date must be greater than or equal to issue date.' };
    }

    if (data.renewalDueDate && new Date(data.renewalDueDate) > new Date(data.expiryDate)) {
      return { success: false, message: 'Renewal due date should not be later than expiry date.' };
    }

    const oldDoc = docs[index];

    // Maintain file characteristics, check if we should auto-transition status
    let newStatus = data.status || oldDoc.status;
    if (oldDoc.fileAssetId) {
      const now = new Date();
      const expiry = new Date(data.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Auto-expire or warning if the status wasn't explicitly set to archived/renewal in progress
      if (newStatus !== DocumentStatus.RENEWAL_IN_PROGRESS && newStatus !== DocumentStatus.ARCHIVED) {
        if (expiry < now) {
          newStatus = DocumentStatus.EXPIRED;
        } else if (daysUntilExpiry <= 30) {
          newStatus = DocumentStatus.EXPIRING_SOON;
        } else {
          newStatus = DocumentStatus.ACTIVE;
        }
      }
    } else {
      newStatus = DocumentStatus.MISSING;
    }

    const updatedDoc: DocumentRecord = {
      ...oldDoc,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description || '',
      ownerUserId: data.ownerUserId,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      renewalDueDate: data.renewalDueDate,
      visibilityScope: data.visibilityScope || 'Global',
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    docs[index] = updatedDoc;
    setStorageItem('docsafe_documents', docs);

    this.logEvent(tenantId, id, 'DOCUMENT_UPDATE', { title: updatedDoc.title }, userName);

    if (oldDoc.status !== newStatus) {
      this.logEvent(tenantId, id, 'STATUS_CHANGE', { oldStatus: oldDoc.status, newStatus: newStatus }, userName);
    }

    return { success: true, message: 'Document metadata updated successfully', data: updatedDoc };
  },

  uploadFile(tenantId: string, id: string, fileName: string, fileSize: string, userName: string): { success: boolean; message: string; data?: DocumentRecord } {
    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const index = docs.findIndex(item => item.id === id && item.tenantId === tenantId);
    
    if (index === -1) {
      return { success: false, message: 'Document not found or access denied.' };
    }

    // Validate size (mock reject > 10MB)
    const sizeInMB = parseFloat(fileSize.split(' ')[0]);
    if (sizeInMB > 10.0) {
      return { success: false, message: 'File size exceeds maximum limit of 10MB.' };
    }

    const oldDoc = docs[index];
    const assetId = generateUUID();

    // Re-evaluate status from MISSING to ACTIVE/EXPIRED/EXPIRING_SOON
    let updatedStatus: DocumentStatus = DocumentStatus.ACTIVE;
    const now = new Date();
    const expiry = new Date(oldDoc.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (expiry < now) {
      updatedStatus = DocumentStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      updatedStatus = DocumentStatus.EXPIRING_SOON;
    }

    const updatedDoc: DocumentRecord = {
      ...oldDoc,
      fileAssetId: assetId,
      fileName,
      fileSize,
      status: updatedStatus,
      updatedAt: new Date().toISOString()
    };

    docs[index] = updatedDoc;
    setStorageItem('docsafe_documents', docs);

    this.logEvent(tenantId, id, 'FILE_UPLOAD', { fileName, fileSize }, userName);
    this.logEvent(tenantId, id, 'STATUS_CHANGE', { oldStatus: oldDoc.status, newStatus: updatedStatus }, userName);

    // Also check if there was a compliance item marked MISSING for this document, set it to PENDING
    const compliance = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    let complianceChanged = false;
    const updatedCompliance = compliance.map(item => {
      if (item.tenantId === tenantId && item.linkedDocumentId === id && item.status === ComplianceStatus.MISSING) {
        complianceChanged = true;
        return {
          ...item,
          status: ComplianceStatus.PENDING,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    if (complianceChanged) {
      setStorageItem('docsafe_compliance_items', updatedCompliance);
      this.logEvent(tenantId, id, 'COMPLIANCE_STATUS_UPDATE', { notes: 'Auto transition to PENDING on file upload' }, userName);
    }

    return { success: true, message: 'File uploaded successfully', data: updatedDoc };
  },

  deleteDocument(tenantId: string, id: string, userName: string): { success: boolean; message: string } {
    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const index = docs.findIndex(item => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return { success: false, message: 'Document not found or access denied.' };
    }

    const deleted = docs.splice(index, 1)[0];
    setStorageItem('docsafe_documents', docs);

    // Clean up linked compliance references or set them null
    const compliance = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    const updatedCompliance = compliance.map(item => {
      if (item.tenantId === tenantId && item.linkedDocumentId === id) {
        return { ...item, linkedDocumentId: null, status: ComplianceStatus.MISSING, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    setStorageItem('docsafe_compliance_items', updatedCompliance);

    // Clean up renewals
    const renewals = getStorageItem<RenewalRecord[]>('docsafe_renewal_records', []);
    const updatedRenewals = renewals.filter(r => !(r.tenantId === tenantId && r.documentId === id));
    setStorageItem('docsafe_renewal_records', updatedRenewals);

    this.logEvent(tenantId, null, 'DOCUMENT_DELETE', { id, title: deleted.title }, userName);

    return { success: true, message: 'Document deleted successfully and linkages cleaned.' };
  },

  // --- COMPLIANCE ---
  getComplianceItems(tenantId: string): ComplianceItem[] {
    const list = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    return list.filter(item => item.tenantId === tenantId);
  },

  createComplianceItem(
    tenantId: string,
    data: {
      name: string;
      categoryId: string | null;
      linkedDocumentId: string | null;
      dueDate: string | null;
      severity: Severity;
      status: ComplianceStatus;
      notes?: string;
    },
    userName: string
  ): { success: boolean; message: string; data?: ComplianceItem } {
    // Tenant check on document link
    if (data.linkedDocumentId) {
      const doc = this.getDocumentById(tenantId, data.linkedDocumentId);
      if (!doc) {
        return { success: false, message: 'Linked Document is invalid or belongs to another tenant.' };
      }
    }

    const newItem: ComplianceItem = {
      id: generateUUID(),
      tenantId,
      name: data.name,
      categoryId: data.categoryId,
      linkedDocumentId: data.linkedDocumentId,
      dueDate: data.dueDate,
      severity: data.severity,
      status: data.status,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    list.push(newItem);
    setStorageItem('docsafe_compliance_items', list);

    this.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_CREATE', { name: newItem.name }, userName);

    return { success: true, message: 'Compliance item created successfully', data: newItem };
  },

  updateComplianceItem(
    tenantId: string,
    id: string,
    data: {
      name: string;
      categoryId: string | null;
      linkedDocumentId: string | null;
      dueDate: string | null;
      severity: Severity;
      status: ComplianceStatus;
      notes?: string;
    },
    userName: string
  ): { success: boolean; message: string; data?: ComplianceItem } {
    const list = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    const index = list.findIndex(item => item.id === id && item.tenantId === tenantId);
    
    if (index === -1) {
      return { success: false, message: 'Compliance item not found or access denied.' };
    }

    if (data.linkedDocumentId) {
      const doc = this.getDocumentById(tenantId, data.linkedDocumentId);
      if (!doc) {
        return { success: false, message: 'Linked Document is invalid or belongs to another tenant.' };
      }
    }

    const oldItem = list[index];
    const updated: ComplianceItem = {
      ...oldItem,
      name: data.name,
      categoryId: data.categoryId,
      linkedDocumentId: data.linkedDocumentId,
      dueDate: data.dueDate,
      severity: data.severity,
      status: data.status,
      notes: data.notes || '',
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    setStorageItem('docsafe_compliance_items', list);

    this.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_UPDATE', { name: updated.name }, userName);
    if (oldItem.status !== data.status) {
      this.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_STATUS_UPDATE', { from: oldItem.status, to: data.status, name: updated.name }, userName);
    }

    return { success: true, message: 'Compliance item updated successfully', data: updated };
  },

  deleteComplianceItem(tenantId: string, id: string, userName: string): { success: boolean; message: string } {
    const list = getStorageItem<ComplianceItem[]>('docsafe_compliance_items', []);
    const index = list.findIndex(item => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return { success: false, message: 'Compliance item not found or access denied.' };
    }

    const deleted = list.splice(index, 1)[0];
    setStorageItem('docsafe_compliance_items', list);

    this.logEvent(tenantId, deleted.linkedDocumentId, 'COMPLIANCE_DELETE', { name: deleted.name }, userName);

    return { success: true, message: 'Compliance item deleted successfully' };
  },

  // --- RENEWALS ---
  getRenewalRecords(tenantId: string): RenewalRecord[] {
    const list = getStorageItem<RenewalRecord[]>('docsafe_renewal_records', []);
    return list.filter(item => item.tenantId === tenantId);
  },

  initiateRenewal(tenantId: string, documentId: string, remarks: string, userId: string, userName: string): { success: boolean; message: string; data?: RenewalRecord } {
    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const index = docs.findIndex(item => item.id === documentId && item.tenantId === tenantId);
    
    if (index === -1) {
      return { success: false, message: 'Document not found or access denied.' };
    }

    const doc = docs[index];
    if (doc.status === DocumentStatus.RENEWAL_IN_PROGRESS) {
      return { success: false, message: 'Renewal is already in progress for this document.' };
    }

    // Set document status to RENEWAL_IN_PROGRESS
    const oldStatus = doc.status;
    doc.status = DocumentStatus.RENEWAL_IN_PROGRESS;
    doc.updatedAt = new Date().toISOString();
    setStorageItem('docsafe_documents', docs);

    // Create renewal log record
    const renewalRecord: RenewalRecord = {
      id: generateUUID(),
      tenantId,
      documentId,
      initiatedBy: userId,
      initiatedAt: new Date().toISOString(),
      stage: 'Initiated',
      remarks,
      completedAt: null,
      status: RenewalStatus.IN_PROGRESS
    };

    const renewals = getStorageItem<RenewalRecord[]>('docsafe_renewal_records', []);
    renewals.push(renewalRecord);
    setStorageItem('docsafe_renewal_records', renewals);

    this.logEvent(tenantId, documentId, 'RENEWAL_INITIATED', { stage: 'Initiated', remarks }, userName);
    this.logEvent(tenantId, documentId, 'STATUS_CHANGE', { oldStatus, newStatus: DocumentStatus.RENEWAL_IN_PROGRESS }, userName);

    return { success: true, message: 'Document renewal initiated successfully', data: renewalRecord };
  },

  updateRenewalStage(tenantId: string, renewalId: string, stage: string, remarks: string, status: RenewalStatus, userName: string): { success: boolean; message: string } {
    const renewals = getStorageItem<RenewalRecord[]>('docsafe_renewal_records', []);
    const index = renewals.findIndex(r => r.id === renewalId && r.tenantId === tenantId);
    if (index === -1) {
      return { success: false, message: 'Renewal record not found.' };
    }

    const renewal = renewals[index];
    renewal.stage = stage;
    renewal.remarks = remarks;
    renewal.status = status;

    const docs = getStorageItem<DocumentRecord[]>('docsafe_documents', []);
    const docIndex = docs.findIndex(d => d.id === renewal.documentId && d.tenantId === tenantId);

    if (status === RenewalStatus.COMPLETED) {
      renewal.completedAt = new Date().toISOString();
      if (docIndex !== -1) {
        // Auto extend document expiry by 1 year as standard simulation
        const currentDoc = docs[docIndex];
        const oldExpiry = new Date(currentDoc.expiryDate);
        oldExpiry.setFullYear(oldExpiry.getFullYear() + 1);
        
        const oldIssue = new Date(currentDoc.issueDate);
        oldIssue.setFullYear(oldIssue.getFullYear() + 1);

        currentDoc.issueDate = oldIssue.toISOString().split('T')[0];
        currentDoc.expiryDate = oldExpiry.toISOString().split('T')[0];
        
        if (currentDoc.renewalDueDate) {
          const oldRenewal = new Date(currentDoc.renewalDueDate);
          oldRenewal.setFullYear(oldRenewal.getFullYear() + 1);
          currentDoc.renewalDueDate = oldRenewal.toISOString().split('T')[0];
        }

        currentDoc.status = DocumentStatus.ACTIVE;
        currentDoc.updatedAt = new Date().toISOString();
        docs[docIndex] = currentDoc;

        this.logEvent(tenantId, renewal.documentId, 'RENEWAL_COMPLETED', { extendedTo: currentDoc.expiryDate }, userName);
        this.logEvent(tenantId, renewal.documentId, 'STATUS_CHANGE', { oldStatus: DocumentStatus.RENEWAL_IN_PROGRESS, newStatus: DocumentStatus.ACTIVE }, userName);
      }
    } else if (status === RenewalStatus.REJECTED) {
      renewal.completedAt = new Date().toISOString();
      if (docIndex !== -1) {
        // Return document to its original status based on dates
        const currentDoc = docs[docIndex];
        const now = new Date();
        const expiry = new Date(currentDoc.expiryDate);
        
        if (expiry < now) {
          currentDoc.status = DocumentStatus.EXPIRED;
        } else {
          currentDoc.status = DocumentStatus.ACTIVE;
        }
        currentDoc.updatedAt = new Date().toISOString();
        docs[docIndex] = currentDoc;

        this.logEvent(tenantId, renewal.documentId, 'RENEWAL_REJECTED', { remarks }, userName);
        this.logEvent(tenantId, renewal.documentId, 'STATUS_CHANGE', { oldStatus: DocumentStatus.RENEWAL_IN_PROGRESS, newStatus: currentDoc.status }, userName);
      }
    } else {
      this.logEvent(tenantId, renewal.documentId, 'RENEWAL_STAGE_UPDATE', { stage, remarks }, userName);
    }

    setStorageItem('docsafe_renewal_records', renewals);
    setStorageItem('docsafe_documents', docs);

    return { success: true, message: 'Renewal progress updated.' };
  },

  // --- SYSTEM LOGS ---
  getEvents(tenantId: string): DocumentEvent[] {
    const list = getStorageItem<DocumentEvent[]>('docsafe_document_events', []);
    return list.filter(item => item.tenantId === tenantId);
  }
};
