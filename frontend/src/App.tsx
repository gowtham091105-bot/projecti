import { useState } from 'react';
import { AppProvider, useApp } from './core/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './modules/docsafe/api/Dashboard';
import { DocumentsList } from './modules/docsafe/api/DocumentsList';
import { DocumentForm } from './modules/docsafe/api/DocumentForm';
import { DocumentDetail } from './modules/docsafe/api/DocumentDetail';
import { ComplianceList } from './modules/docsafe/api/ComplianceList';
import { CategoriesList } from './modules/docsafe/api/CategoriesList';
import { ExpiringSoonList } from './modules/docsafe/api/ExpiringSoonList';
import { AuditLogsList } from './modules/docsafe/api/AuditLogsList';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  
  const { toasts, removeToast } = useApp();

  // Switch pages based on active Tab state
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            setSelectedDocId={setSelectedDocId} 
          />
        );
      case 'documents':
        return (
          <DocumentsList 
            setCurrentTab={setCurrentTab} 
            setSelectedDocId={setSelectedDocId}
            setEditDocId={setEditDocId}
          />
        );
      case 'doc-form':
        return (
          <DocumentForm 
            editDocId={editDocId} 
            setCurrentTab={setCurrentTab} 
          />
        );
      case 'doc-detail':
        return selectedDocId ? (
          <DocumentDetail 
            docId={selectedDocId} 
            setCurrentTab={setCurrentTab} 
            setEditDocId={setEditDocId}
          />
        ) : (
          <div className="empty-state">No document selected.</div>
        );
      case 'compliance':
        return <ComplianceList />;
      case 'categories':
        return <CategoriesList />;
      case 'expiring':
        return (
          <ExpiringSoonList 
            setCurrentTab={setCurrentTab} 
            setSelectedDocId={setSelectedDocId} 
          />
        );
      case 'audit':
        return <AuditLogsList />;
      default:
        return <div className="empty-state">Page not found.</div>;
    }
  };

  // Convert tab ID to display title for Header
  const getHeaderTitle = () => {
    switch(currentTab) {
      case 'dashboard': return 'Docsafe Dashboard Analytics';
      case 'documents': return 'Document Management';
      case 'doc-form': return editDocId ? 'Modify Document Metadata' : 'Add New Document Record';
      case 'doc-detail': return 'Document Scope Detail';
      case 'compliance': return 'Compliance Requirements & Status';
      case 'categories': return 'Category Masters Management';
      case 'expiring': return 'Critical Renewal Expirations';
      case 'audit': return 'Security Audit Logs';
      default: return 'Docsafe Compliance';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header title={getHeaderTitle()} />
        
        <main className="content-body">
          {renderContent()}
        </main>
      </div>

      {/* Toast Notification HUD */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
