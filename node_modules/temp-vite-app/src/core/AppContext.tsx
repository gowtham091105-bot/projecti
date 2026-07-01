import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb, TENANTS, USERS } from './mockDb';
import type { Category, DocumentRecord, ComplianceItem, RenewalRecord, DocumentEvent, Tenant, User } from './mockDb';
import { DocumentStatus, ComplianceStatus, Severity } from '../shared/enums/docsafe';

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
  isSandbox: boolean; // True if backend is offline and we are using localStorage mockDb
  
  switchTenant: (tenantId: string) => void;
  switchUser: (userId: string) => void;
  refreshData: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Wrapped CRUDs
  createCategory: (name: string, description: string, isActive: boolean) => Promise<boolean>;
  updateCategory: (id: string, name: string, description: string, isActive: boolean) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

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
  }, file: File | null) => Promise<boolean>;
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
  }) => Promise<boolean>;
  uploadFile: (id: string, file: File) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;

  createComplianceItem: (data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => Promise<boolean>;
  updateComplianceItem: (id: string, data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => Promise<boolean>;
  deleteComplianceItem: (id: string) => Promise<boolean>;

  initiateRenewal: (documentId: string, remarks: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = 'http://localhost:3000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTenant, setActiveTenant] = useState<Tenant>(TENANTS[0]);
  const [activeUser, setActiveUser] = useState<User>(USERS[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [renewalRecords, setRenewalRecords] = useState<RenewalRecord[]>([]);
  const [events, setEvents] = useState<DocumentEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('docsafe_jwt_token'));

  // Helper for requests
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('x-tenant-id', activeTenant.id);
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (res.status === 401) {
      // Token expired or invalid
      setToken(null);
      localStorage.removeItem('docsafe_jwt_token');
    }
    return res.json();
  };

  // Perform background authentication with the backend
  const authenticateUser = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.token) {
          setToken(body.token);
          localStorage.setItem('docsafe_jwt_token', body.token);
          setIsSandbox(false);
          return true;
        }
      }
    } catch (e) {
      // Backend unreachable
    }
    setIsSandbox(true);
    return false;
  };

  // Load and refresh state data
  const refreshData = async () => {
    if (isSandbox) {
      setCategories(mockDb.getCategories(activeTenant.id));
      setDocuments(mockDb.getDocuments(activeTenant.id));
      setComplianceItems(mockDb.getComplianceItems(activeTenant.id));
      setRenewalRecords(mockDb.getRenewalRecords(activeTenant.id));
      setEvents(mockDb.getEvents(activeTenant.id));
      return;
    }

    try {
      // Fetch from NestJS endpoints
      const [catsRes, docsRes, compRes, dashRes] = await Promise.all([
        apiFetch('/docsafe/categories'),
        apiFetch('/docsafe/documents'),
        apiFetch('/docsafe/compliance-items'),
        apiFetch('/docsafe/dashboard/summary')
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (docsRes.success) {
        // Map backend Date objects back to ISO-8601 strings
        const formattedDocs = docsRes.data.map((d: any) => ({
          ...d,
          issueDate: d.issueDate.split('T')[0],
          expiryDate: d.expiryDate.split('T')[0],
          renewalDueDate: d.renewalDueDate ? d.renewalDueDate.split('T')[0] : undefined
        }));
        setDocuments(formattedDocs);
      }
      if (compRes.success) {
        const formattedComp = compRes.data.map((c: any) => ({
          ...c,
          dueDate: c.dueDate ? c.dueDate.split('T')[0] : null
        }));
        setComplianceItems(formattedComp);
      }
      if (dashRes.success && dashRes.data.recentEvents) {
        setEvents(dashRes.data.recentEvents);
      }
    } catch (e) {
      console.warn('NestJS server lost connection. Gracefully falling back to client Sandbox mode.');
      setIsSandbox(true);
      addToast('Backend offline: Falling back to sandbox storage mode', 'warning');
      // Read local storage fallback
      setCategories(mockDb.getCategories(activeTenant.id));
      setDocuments(mockDb.getDocuments(activeTenant.id));
      setComplianceItems(mockDb.getComplianceItems(activeTenant.id));
      setRenewalRecords(mockDb.getRenewalRecords(activeTenant.id));
      setEvents(mockDb.getEvents(activeTenant.id));
    }
  };

  // Initialize ping on load to choose mode
  useEffect(() => {
    const init = async () => {
      const isOnline = await authenticateUser(activeUser.id);
      if (isOnline) {
        console.log('Connected to NestJS backend.');
      } else {
        console.log('Running in client-side Local Sandbox Mode.');
      }
    };
    init().then(() => refreshData());
  }, [activeTenant, activeUser]);

  const switchTenant = (tenantId: string) => {
    const tenant = TENANTS.find(t => t.id === tenantId);
    if (tenant) {
      setActiveTenant(tenant);
      const firstTenantUser = USERS.find(u => u.tenantId === tenantId);
      if (firstTenantUser) {
        setActiveUser(firstTenantUser);
      }
      addToast(`Switched Tenant to ${tenant.name}`, 'info');
    }
  };

  const switchUser = async (userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      if (user.tenantId !== activeTenant.id) {
        const tenant = TENANTS.find(t => t.id === user.tenantId);
        if (tenant) {
          setActiveTenant(tenant);
        }
      }
      await authenticateUser(userId);
      addToast(`Switched User to ${user.name} (${user.role})`, 'info');
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type: type === 'warning' ? 'error' : type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // CRUD API implementations
  const createCategory = async (name: string, description: string, isActive: boolean) => {
    if (isSandbox) {
      const res = mockDb.createCategory(activeTenant.id, name, description, isActive, activeUser.id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch('/docsafe/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description, isActive }),
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error creating category', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, description: string, isActive: boolean) => {
    if (isSandbox) {
      const res = mockDb.updateCategory(activeTenant.id, id, name, description, isActive, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, isActive }),
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error updating category', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (isSandbox) {
      const res = mockDb.deleteCategory(activeTenant.id, id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error deleting category', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const createDocument = async (data: {
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
  }, file: File | null = null) => {
    if (isSandbox) {
      const res = mockDb.createDocument(activeTenant.id, data, activeUser.id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch('/docsafe/documents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.success && res.data && res.data.id) {
        if (file) {
          const uploadRes = await uploadFile(res.data.id, file);
          if (!uploadRes) {
            addToast('Document created but file upload failed', 'error');
          }
        } else {
          addToast(res.message, 'success');
        }
        refreshData();
        return true;
      } else {
        addToast(res.message || 'Error creating document', 'error');
        return false;
      }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const updateDocument = async (id: string, data: {
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
    if (isSandbox) {
      const res = mockDb.updateDocument(activeTenant.id, id, data, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res.success) {
        addToast(res.message, 'success');
        refreshData();
        return true;
      } else {
        addToast(res.message || 'Error updating document', 'error');
        return false;
      }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const uploadFile = async (id: string, file: File) => {
    if (isSandbox) {
      const res = mockDb.uploadFile(activeTenant.id, id, file.name, `${(file.size / (1024 * 1024)).toFixed(2)} MB`, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiFetch(`/docsafe/documents/${id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        addToast(res.message, 'success');
        refreshData();
        return true;
      } else {
        addToast(res.message || 'Error uploading file', 'error');
        return false;
      }
    } catch (e) {
      addToast('File upload failed: network error', 'error');
      return false;
    }
  };

  const deleteDocument = async (id: string) => {
    if (isSandbox) {
      const res = mockDb.deleteDocument(activeTenant.id, id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/documents/${id}`, {
        method: 'DELETE',
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error deleting document', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const createComplianceItem = async (data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => {
    if (isSandbox) {
      const res = mockDb.createComplianceItem(activeTenant.id, data, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch('/docsafe/compliance-items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error creating compliance item', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const updateComplianceItem = async (id: string, data: {
    name: string;
    categoryId: string | null;
    linkedDocumentId: string | null;
    dueDate: string | null;
    severity: Severity;
    status: ComplianceStatus;
    notes?: string;
  }) => {
    if (isSandbox) {
      const res = mockDb.updateComplianceItem(activeTenant.id, id, data, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/compliance-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error updating compliance item', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const deleteComplianceItem = async (id: string) => {
    if (isSandbox) {
      const res = mockDb.deleteComplianceItem(activeTenant.id, id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/compliance-items/${id}`, {
        method: 'DELETE',
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error deleting compliance item', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
      return false;
    }
  };

  const initiateRenewal = async (documentId: string, remarks: string) => {
    if (isSandbox) {
      const res = mockDb.initiateRenewal(activeTenant.id, documentId, remarks, activeUser.id, activeUser.name);
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message, 'error'); return false; }
    }

    try {
      const res = await apiFetch(`/docsafe/documents/${documentId}/renewal`, {
        method: 'POST',
        body: JSON.stringify({ remarks }),
      });
      if (res.success) { addToast(res.message, 'success'); refreshData(); return true; }
      else { addToast(res.message || 'Error initiating renewal', 'error'); return false; }
    } catch (e) {
      addToast('Network Request failed', 'error');
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
        isSandbox,
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
        initiateRenewal
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
