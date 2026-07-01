import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Tags, 
  Clock, 
  History 
} from 'lucide-react';
import { useApp } from '../core/AppContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { documents, complianceItems } = useApp();

  // Calculate quick notifications
  const expiringCount = documents.filter(d => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED').length;
  const missingComplianceCount = complianceItems.filter(c => c.status === 'MISSING').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'compliance', label: 'Compliance', icon: ShieldAlert, count: missingComplianceCount, countClass: 'danger' },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'expiring', label: 'Expiring Soon', icon: Clock, count: expiringCount, countClass: expiringCount > 0 ? 'warning' : '' },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <FileText className="nav-icon" style={{ strokeWidth: 2.5 }} />
        </div>
        <span className="logo-text">Docsafe</span>
      </div>

      <ul className="nav-links">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <li key={item.id}>
              <a 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentTab(item.id)}
              >
                <Icon className="nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`badge ${item.countClass || 'info'}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                    {item.count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div>Docsafe Phase 1 v1.0</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>© 2026 Vistalane Solutions</div>
      </div>
    </div>
  );
};
export default Sidebar;
