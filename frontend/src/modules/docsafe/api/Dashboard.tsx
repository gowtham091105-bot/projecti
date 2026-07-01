import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  RefreshCw, 
  TrendingUp, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../../core/AppContext';
import { DocumentStatus, ComplianceStatus } from '../../../shared/enums/docsafe';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  setSelectedDocId: (id: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab, setSelectedDocId }) => {
  const { documents, complianceItems, events } = useApp();

  // Metrics (Section 18 Dashboard logic)   
  const totalDocs = documents.length;
  const activeDocs = documents.filter(d => d.status === DocumentStatus.ACTIVE).length;
  const expiringSoonDocs = documents.filter(d => d.status === DocumentStatus.EXPIRING_SOON).length;
  const expiredDocs = documents.filter(d => d.status === DocumentStatus.EXPIRED).length;
  
  const missingCompliance = complianceItems.filter(c => c.status === ComplianceStatus.MISSING).length;
  const renewalInProgress = documents.filter(d => d.status === DocumentStatus.RENEWAL_IN_PROGRESS).length;

  // Recent activity (latest 5 events)
  const recentActivities = events.slice(0, 5);

  // Quick Lists
  const expiringSoonList = documents.filter(d => d.status === DocumentStatus.EXPIRING_SOON).slice(0, 3);
  const missingComplianceList = complianceItems.filter(c => c.status === ComplianceStatus.MISSING).slice(0, 3);

  // Calculations for custom SVG chart
  const hasDocs = totalDocs > 0;
  const activePercent = hasDocs ? Math.round((activeDocs / totalDocs) * 100) : 0;
  const expiringPercent = hasDocs ? Math.round((expiringSoonDocs / totalDocs) * 100) : 0;
  const expiredPercent = hasDocs ? Math.round((expiredDocs / totalDocs) * 100) : 0;

  const handleDocClick = (id: string) => {
    setSelectedDocId(id);
    setCurrentTab('doc-detail');
  };

  const statCardsData = [
    { label: 'Total Documents', value: totalDocs, icon: FileText, color: 'var(--primary)', bg: 'var(--primary-glow)', tab: 'documents' },
    { label: 'Active Documents', value: activeDocs, icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-glow)', tab: 'documents' },
    { label: 'Expiring Soon', value: expiringSoonDocs, icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-glow)', tab: 'expiring' },
    { label: 'Expired Documents', value: expiredDocs, icon: AlertOctagon, color: 'var(--danger)', bg: 'var(--danger-glow)', tab: 'documents' },
    { label: 'Missing Compliance', value: missingCompliance, icon: HelpCircle, color: 'var(--danger)', bg: 'var(--danger-glow)', tab: 'compliance' },
    { label: 'Renewal In Progress', value: renewalInProgress, icon: RefreshCw, color: 'var(--info)', bg: 'var(--info-glow)', tab: 'documents' }
  ];

  return (
    <div>
      {/* Metric Cards Grid */}
      <div className="dashboard-grid">
        {statCardsData.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="stat-card" 
              style={{ '--accent': card.color, '--bg-glow': card.bg } as React.CSSProperties}
              onClick={() => setCurrentTab(card.tab)}
            >
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{card.value}</span>
                <span className="stat-label">{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Analytics Chart and Quick Statistics */}
      <div className="dashboard-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-title">
          <span>Document Health & Distribution</span>
          <span className="badge success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Compliance Rate: {hasDocs ? Math.round(((activeDocs + expiringSoonDocs) / totalDocs) * 100) : 0}%
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'center', padding: '12px 0' }}>
          {/* Custom SVG Donut Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <svg width="180" height="180" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
              {hasDocs ? (
                <>
                  {/* Active segment */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--success)" strokeWidth="3.2" 
                    strokeDasharray={`${activePercent} ${100 - activePercent}`} 
                    strokeDashoffset="0" />
                  {/* Expiring segment */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--warning)" strokeWidth="3.2" 
                    strokeDasharray={`${expiringPercent} ${100 - expiringPercent}`} 
                    strokeDashoffset={`-${activePercent}`} />
                  {/* Expired segment */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--danger)" strokeWidth="3.2" 
                    strokeDasharray={`${expiredPercent} ${100 - expiredPercent}`} 
                    strokeDashoffset={`-${activePercent + expiringPercent}`} />
                </>
              ) : (
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" />
              )}
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>{totalDocs}</span>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total</div>
            </div>
          </div>

          {/* Legend and progress bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                  Active Documents ({activeDocs})
                </span>
                <span style={{ fontWeight: 600 }}>{activePercent}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${activePercent}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                  Expiring Soon ({expiringSoonDocs})
                </span>
                <span style={{ fontWeight: 600 }}>{expiringPercent}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${expiringPercent}%`, height: '100%', background: 'var(--warning)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>
                  Expired / Missing Documents ({expiredDocs})
                </span>
                <span style={{ fontWeight: 600 }}>{expiredPercent}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${expiredPercent}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Left Side: Recent Activity Feed */}
        <div className="dashboard-panel">
          <div className="panel-title">
            <span>Recent Activity Audit Trail</span>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setCurrentTab('audit')}>
              View All Logs
            </button>
          </div>
          
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <span className="empty-state-title" style={{ fontSize: '14px' }}>No recent events</span>
                <p style={{ fontSize: '12px' }}>Perform an action like uploading or renewing a document to start logging activity.</p>
              </div>
            ) : (
              recentActivities.map((act) => {
                let dotClass = 'info';
                if (act.eventType.includes('EXPIRED') || act.eventType.includes('DELETE') || act.eventType.includes('REJECTED')) dotClass = 'danger';
                if (act.eventType.includes('CREATE') || act.eventType.includes('UPLOAD') || act.eventType.includes('COMPLETED')) dotClass = 'success';
                if (act.eventType.includes('UPDATE')) dotClass = 'warning';

                let details = '';
                try {
                  const payload = act.payloadJson ? JSON.parse(act.payloadJson) : {};
                  if (payload.title) details = `Document: "${payload.title}"`;
                  else if (payload.name) details = `Item: "${payload.name}"`;
                  else if (payload.fileName) details = `File: "${payload.fileName}" (${payload.size || ''})`;
                  else if (payload.extendedTo) details = `Validity extended to: ${payload.extendedTo}`;
                } catch (e) {}

                return (
                  <div key={act.id} className="activity-item">
                    <span className={`activity-dot ${dotClass}`}></span>
                    <div className="activity-details">
                      <div className="activity-text">
                        <strong>{act.eventType.replace(/_/g, ' ')}</strong>
                        {details && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>{details}</div>}
                      </div>
                      <div className="activity-meta">
                        <span>Initiated by: {act.triggeredBy}</span>
                        <span>{new Date(act.triggeredAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Quick Lists */}
        <div className="dashboard-panel">
          <div className="panel-title">
            <span>Critical Quick Action Lists</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Expiring soon quick list */}
            <div>
              <h4 style={{ fontSize: '14px', color: 'var(--warning)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} /> Expiring Soon Documents
              </h4>
              <div className="quick-list">
                {expiringSoonList.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px' }}>
                    No documents expiring in next 30 days!
                  </div>
                ) : (
                  expiringSoonList.map(doc => (
                    <div key={doc.id} className="quick-list-item">
                      <div className="quick-list-left">
                        <span className="quick-list-title">{doc.title}</span>
                        <span className="quick-list-sub">Expires: {doc.expiryDate}</span>
                      </div>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDocClick(doc.id)}
                        title="View Document Details"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missing Compliance Items quick list */}
            <div>
              <h4 style={{ fontSize: '14px', color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={14} /> Missing Compliance Items
              </h4>
              <div className="quick-list">
                {missingComplianceList.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px' }}>
                    All compliance requirements are active.
                  </div>
                ) : (
                  missingComplianceList.map(comp => (
                    <div key={comp.id} className="quick-list-item">
                      <div className="quick-list-left">
                        <span className="quick-list-title">{comp.name}</span>
                        <span className="quick-list-sub" style={{ color: 'var(--danger)' }}>Status: {comp.status}</span>
                      </div>
                      <button 
                        className="btn-icon" 
                        onClick={() => setCurrentTab('compliance')}
                        title="Go to Compliance Management"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
