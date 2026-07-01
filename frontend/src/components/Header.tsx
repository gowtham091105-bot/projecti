import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Award } from 'lucide-react';
import { useApp } from '../core/AppContext';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { 
    activeTenant, 
    activeUser, 
    tenants, 
    users, 
    switchTenant, 
    switchUser,
    events
  } = useApp();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchTenant(e.target.value);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchUser(e.target.value);
  };

  // Filter events for notification drawer (only show latest 5 events)
  const recentEvents = events.slice(0, 5);

  return (
    <header className="header">
      <div className="header-title-section">
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{title}</h2>
        <span className="breadcrumb" style={{ marginLeft: '12px' }}>
          / {activeTenant.name}
        </span>
      </div>

      <div className="header-controls">
        {/* Simulator Control Panel */}
        <div className="simulator-panel">
          <div className="selector-wrapper">
            <span className="selector-label">Tenant:</span>
            <select 
              value={activeTenant.id} 
              onChange={handleTenantChange}
              className="sim-select"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="selector-wrapper" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
            <span className="selector-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={12} color="var(--primary)" /> Role:
            </span>
            <select 
              value={activeUser.id} 
              onChange={handleUserChange}
              className="sim-select"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Toggle */}
        <button 
          className="action-btn-circle" 
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="action-btn-circle"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {recentEvents.length > 0 && <span className="badge-dot"></span>}
          </button>

          {showNotifications && (
            <div 
              className="modal-content"
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Recent Activity Alerts</span>
                <span className="badge info" style={{ fontSize: '10px' }}>Real-time</span>
              </div>

              {recentEvents.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No recent activities recorded.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentEvents.map(evt => {
                    let text = `${evt.eventType.replace('_', ' ')}`;
                    try {
                      const payload = evt.payloadJson ? JSON.parse(evt.payloadJson) : {};
                      if (payload.title) text += `: ${payload.title}`;
                      else if (payload.name) text += `: ${payload.name}`;
                      else if (payload.fileName) text += `: ${payload.fileName}`;
                    } catch (e) {}

                    return (
                      <div key={evt.id} style={{ fontSize: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{text}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '4px', fontSize: '10px' }}>
                          <span>By {evt.triggeredBy}</span>
                          <span>{new Date(evt.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
