import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb, TENANTS, USERS } from './mockDb';
import type { Category, DocumentRecord, ComplianceItem, RenewalRecord, DocumentEvent, Tenant, User } from './mockDb';
import { DocumentStatus, ComplianceStatus, RenewalStatus, Severity } from '../shared/enums/docsafe';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeTenant: Tenant;
  activeUser: User;
  tenants: Tenant[];
  users: User[];
  categories: Category[];
  documents: DocumentRecord[];
  complianceItems: ComplianceItem[];
  renewalRecords: RenewalRecord[];
  events: DocumentEvent[];
  toasts: Toast[];
  
  switchTenant: (tenantId: string) => void;
  switchUser: (userId: string) => void;
  refreshData: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Wrapped CRUDs
  createCategory: (name: string, description: string, isActive: boolean) => boolean;
  updateCategory: (id: string, name: string, description: string, isActive: boolean) => boolean;
  deleteCategory: (id: string) => boolean;

  createDocument: (data: {
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
  }) => boolean;
  updateDocument: (id: string, data: {
    title: string;
    categoryId: string;
    description?: string;
    ownerUserId: string;
    issueDate: string;
    expiryDate: string;
    renewalDueDate?: string;
    visibilityScope?: string;
    status?: DocumentStatus;
  }) => boolean;
  uploadFile: (id: string, fileName: string, fileSize: string) => boolean;
  deleteDocument: (id: string) => boolean;

  createComplianceItem: (data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => boolean;
  updateComplianceItem: (id: string, data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => boolean;
  deleteComplianceItem: (id: string) => boolean;

  initiateRenewal: (documentId: string, remarks: string) => boolean;
  updateRenewalStage: (renewalId: string, stage: string, remarks: string, status: RenewalStatus) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTenant, setActiveTenant] = useState<Tenant>(TENANTS[0]);
  const [activeUser, setActiveUser] = useState<User>(USERS[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [renewalRecords, setRenewalRecords] = useState<RenewalRecord[]>([]);
  const [events, setEvents] = useState<DocumentEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load and refresh state data
  const refreshData = () => {
    setCategories(mockDb.getCategories(activeTenant.id));
    setDocuments(mockDb.getDocuments(activeTenant.id));
    setComplianceItems(mockDb.getComplianceItems(activeTenant.id));
    setRenewalRecords(mockDb.getRenewalRecords(activeTenant.id));
    setEvents(mockDb.getEvents(activeTenant.id));
  };

  // Run refresh when tenant changes
  useEffect(() => {
    refreshData();
  }, [activeTenant]);

  const switchTenant = (tenantId: string) => {
    const tenant = TENANTS.find(t => t.id === tenantId);
    if (tenant) {
      setActiveTenant(tenant);
      // Auto switch to first user of that tenant to maintain consistent state
      const firstTenantUser = USERS.find(u => u.tenantId === tenantId);
      if (firstTenantUser) {
        setActiveUser(firstTenantUser);
      }
      addToast(`Switched Tenant to ${tenant.name}`, 'info');
    }
  };

  const switchUser = (userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      // Force switch tenant if user belongs to another tenant
      if (user.tenantId !== activeTenant.id) {
        const tenant = TENANTS.find(t => t.id === user.tenantId);
        if (tenant) {
          setActiveTenant(tenant);
        }
      }
      addToast(`Switched User to ${user.name} (${user.role})`, 'info');
    }
  };

  // Toast Management
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // WRAPPED OPERATIONS WITH TOASTS & REFRESHES
  const createCategory = (name: string, description: string, isActive: boolean) => {
    const res = mockDb.createCategory(activeTenant.id, name, description, isActive, activeUser.id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const updateCategory = (id: string, name: string, description: string, isActive: boolean) => {
    const res = mockDb.updateCategory(activeTenant.id, id, name, description, isActive, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const deleteCategory = (id: string) => {
    const res = mockDb.deleteCategory(activeTenant.id, id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const createDocument = (data: {
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
  }) => {
    const res = mockDb.createDocument(activeTenant.id, data, activeUser.id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const updateDocument = (id: string, data: {
    title: string;
    categoryId: string;
    description?: string;
    ownerUserId: string;
    issueDate: string;
    expiryDate: string;
    renewalDueDate?: string;
    visibilityScope?: string;
    status?: DocumentStatus;
  }) => {
    const res = mockDb.updateDocument(activeTenant.id, id, data, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const uploadFile = (id: string, fileName: string, fileSize: string) => {
    const res = mockDb.uploadFile(activeTenant.id, id, fileName, fileSize, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const deleteDocument = (id: string) => {
    const res = mockDb.deleteDocument(activeTenant.id, id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const createComplianceItem = (data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => {
    const res = mockDb.createComplianceItem(activeTenant.id, data, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const updateComplianceItem = (id: string, data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => {
    const res = mockDb.updateComplianceItem(activeTenant.id, id, data, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const deleteComplianceItem = (id: string) => {
    const res = mockDb.deleteComplianceItem(activeTenant.id, id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const initiateRenewal = (documentId: string, remarks: string) => {
    const res = mockDb.initiateRenewal(activeTenant.id, documentId, remarks, activeUser.id, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  const updateRenewalStage = (renewalId: string, stage: string, remarks: string, status: RenewalStatus) => {
    const res = mockDb.updateRenewalStage(activeTenant.id, renewalId, stage, remarks, status, activeUser.name);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
      return true;
    } else {
      addToast(res.message, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTenant,
        activeUser,
        tenants: TENANTS,
        users: USERS,
        categories,
        documents,
        complianceItems,
        renewalRecords,
        events,
        toasts,
        switchTenant,
        switchUser,
        refreshData,
        addToast,
        removeToast,
        createCategory,
        updateCategory,
        deleteCategory,
        createDocument,
        updateDocument,
        uploadFile,
        deleteDocument,
        createComplianceItem,
        updateComplianceItem,
        deleteComplianceItem,
        initiateRenewal,
        updateRenewalStage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
