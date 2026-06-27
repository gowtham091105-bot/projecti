import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Download, 
  RefreshCw,
  Calendar,
  Eye,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../core/AppContext';
import { DocumentStatus, RenewalStatus } from '../../../shared/enums/docsafe';

interface DocumentDetailProps {
  docId: string;
  setCurrentTab: (tab: string) => void;
  setEditDocId: (id: string | null) => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ docId, setCurrentTab, setEditDocId }) => {
  const { 
    documents, 
    categories, 
    users, 
    complianceItems, 
    renewalRecords, 
    events,
    activeUser,
    initiateRenewal,
    uploadFile
  } = useApp();

  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalRemarks, setRenewalRemarks] = useState('');

  const doc = documents.find(d => d.id === docId);

  if (!doc) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Document Not Found</h3>
        <p>The document may have been deleted or belongs to another tenant.</p>
        <button className="btn btn-secondary" onClick={() => setCurrentTab('documents')}>
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>
    );
  }

  const isViewer = activeUser.role === 'Viewer';

  // Category and User details
  const category = categories.find(c => c.id === doc.categoryId);
  const owner = users.find(u => u.id === doc.ownerUserId);
  const uploader = users.find(u => u.id === doc.uploadedBy);

  // Filter linked compliance items
  const linkedCompliance = complianceItems.filter(item => item.linkedDocumentId === doc.id);

  // Filter renewals
  const renewalHistory = renewalRecords.filter(r => r.documentId === doc.id);
  const activeRenewal = renewalHistory.find(r => r.status === RenewalStatus.IN_PROGRESS || r.status === RenewalStatus.INITIATED);

  // Filter audit events specific to this document
  const docEvents = events.filter(evt => evt.documentId === doc.id);

  // Handle Edit Action
  const handleEdit = () => {
    setEditDocId(doc.id);
    setCurrentTab('doc-form');
  };

  // Handle Download simulation
  const handleDownload = () => {
    if (!doc.fileName) return;
    
    // Create a temporary element to trigger simulated file download
    const element = document.createElement("a");
    const fileContent = `Simulated PDF Document Content for: ${doc.title}\nCategory: ${category?.name || 'N/A'}\nExpiry Date: ${doc.expiryDate}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.fileName.replace('.pdf', '_copy.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle Initiate Renewal
  const handleStartRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewalRemarks.trim()) return;

    const success = initiateRenewal(doc.id, renewalRemarks);
    if (success) {
      setShowRenewalModal(false);
      setRenewalRemarks('');
    }
  };

  // File drop simulation for MISSING documents
  const handleFileDropSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadFile(doc.id, file.name, `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  // Render status badge helper
  const getStatusBadge = (status: DocumentStatus) => {
    switch(status) {
      case DocumentStatus.ACTIVE:
        return <span className="badge success">Active</span>;
      case DocumentStatus.EXPIRING_SOON:
        return <span className="badge warning">Expiring Soon</span>;
      case DocumentStatus.EXPIRED:
        return <span className="badge danger">Expired</span>;
      case DocumentStatus.RENEWAL_IN_PROGRESS:
        return <span className="badge info">Renewal In Progress</span>;
      case DocumentStatus.ARCHIVED:
        return <span className="badge purple">Archived</span>;
      case DocumentStatus.MISSING:
        return <span className="badge danger">Missing File</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Detail View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentTab('documents')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Documents
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleEdit}
            disabled={isViewer}
            title={isViewer ? "Viewer accounts cannot edit" : "Edit Metadata"}
          >
            <Edit size={16} /> Edit Document
          </button>
          
          {doc.fileAssetId && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDocPreview(true)}
              >
                <Eye size={16} /> View File
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={handleDownload}
              >
                <Download size={16} /> Download
              </button>
            </>
          )}

          {/* Trigger Renewal Option */}
          {(doc.status === DocumentStatus.EXPIRED || doc.status === DocumentStatus.EXPIRING_SOON || doc.status === DocumentStatus.ACTIVE) && !activeRenewal && (
            <button 
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--purple)', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)' }}
              onClick={() => setShowRenewalModal(true)}
              disabled={isViewer}
              title={isViewer ? "Viewer accounts cannot initiate renewal" : "Initiate Renewal lifecycle"}
            >
              <RefreshCw size={16} /> Start Renewal
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details left, widgets right */}
      <div className="detail-grid">
        <div className="detail-main">
          {/* Metadata Card */}
          <div className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge info" style={{ marginBottom: '8px' }}>
                  {category?.name || 'No Category'}
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 700 }}>{doc.title}</h3>
              </div>
              <div>{getStatusBadge(doc.status)}</div>
            </div>

            {doc.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                {doc.description}
              </p>
            )}

            <div className="detail-section-title">Metadata Details</div>
            
            <div className="meta-rows">
              <div>
                <div className="meta-label">Owner Name</div>
                <div className="meta-value">{owner?.name || 'Unassigned'}</div>
              </div>
              
              <div>
                <div className="meta-label">Visibility Scope</div>
                <div className="meta-value">{doc.visibilityScope || 'Global'}</div>
              </div>

              <div>
                <div className="meta-label">Issue Date</div>
                <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" /> {doc.issueDate}
                </div>
              </div>

              <div>
                <div className="meta-label">Expiry Date</div>
                <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" /> {doc.expiryDate}
                </div>
              </div>

              {doc.renewalDueDate && (
                <div>
                  <div className="meta-label">Renewal Due Date</div>
                  <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--text-muted)" /> {doc.renewalDueDate}
                  </div>
                </div>
              )}

              <div>
                <div className="meta-label">Uploaded By</div>
                <div className="meta-value">{uploader?.name || 'System'}</div>
              </div>
            </div>
          </div>

          {/* File Attachment Card */}
          <div className="detail-card">
            <div className="detail-section-title">File Asset Storage Reference</div>
            
            {doc.fileAssetId ? (
              <div className="file-info-block">
                <div className="file-info-left">
                  <FileText className="file-icon" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{doc.fileName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Size: {doc.fileSize} | Reference ID: {doc.fileAssetId}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setShowDocPreview(true)}>
                    Preview
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="badge danger" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <AlertTriangle size={12} /> Compliance Warning: Document file asset is missing!
                </div>
                
                {isViewer ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Viewer role cannot upload missing document files.
                  </p>
                ) : (
                  <label className="file-upload-zone" style={{ padding: '24px' }}>
                    <input 
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileDropSimulate}
                      style={{ display: 'none' }}
                    />
                    <Plus className="file-upload-icon" style={{ width: '36px', height: '36px' }} />
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Simulate Uploading File</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag-drop or browse PDF to resolve Missing status.</div>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Widget Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Linked Compliance item */}
          <div className="detail-card">
            <div className="detail-section-title">Linked Compliance Rules</div>
            {linkedCompliance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>No compliance rules linked.</div>
                {!isViewer && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => setCurrentTab('compliance')}
                  >
                    Manage Compliance
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {linkedCompliance.map(item => (
                  <div key={item.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span className={`badge ${item.severity === 'HIGH' ? 'danger' : item.severity === 'MEDIUM' ? 'warning' : 'info'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {item.severity} severity
                      </span>
                      <span className={`badge ${item.status === 'COMPLIANT' ? 'success' : 'warning'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {item.status}
                      </span>
                    </div>
                    {item.dueDate && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {item.dueDate}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Renewal Lifecycle */}
          <div className="detail-card">
            <div className="detail-section-title">Renewal Tracking</div>
            {renewalHistory.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No renewals initiated yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {renewalHistory.map(record => (
                  <div key={record.id} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', borderLeft: '3px solid var(--purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{record.stage}</span>
                      <span className="badge purple" style={{ fontSize: '9px', padding: '1px 5px' }}>{record.status}</span>
                    </div>
                    {record.remarks && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                        "{record.remarks}"
                      </div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Date: {new Date(record.initiatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History log */}
          <div className="detail-card">
            <div className="detail-section-title">Audit Log History</div>
            {docEvents.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No logs for this document.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                {docEvents.map(evt => (
                  <div key={evt.id} style={{ fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                    <div style={{ fontWeight: 500 }}>{evt.eventType.replace(/_/g, ' ')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                      <span>By {evt.triggeredBy}</span>
                      <span>{new Date(evt.triggeredAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW PREVIEW MODAL */}
      {showDocPreview && (
        <div className="modal-overlay" onClick={() => setShowDocPreview(false)}>
          <div className="modal-content" style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Preview: {doc.fileName}</span>
              <button className="btn-icon" onClick={() => setShowDocPreview(false)}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '40px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb', color: '#1f2937' }}>
              <div style={{ border: '2px solid #374151', borderRadius: '4px', background: '#fff', padding: '32px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>DOCSAFE SIMULATED RECORD</span>
                  <span style={{ border: '1px solid #111827', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}>OFFICIAL</span>
                </div>
                <div style={{ flex: 1, margin: '24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase' }}>{doc.title}</h2>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>Document ID: {doc.id}</div>
                  <div style={{ fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
                    This document certifies compliance under category <strong>{category?.name || 'N/A'}</strong>.
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '8px', color: '#6b7280' }}>
                    "Valid and isolation-scoped to tenant: {doc.tenantId}"
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid #d1d5db', paddingTop: '8px' }}>
                  <div>Issue Date: {doc.issueDate}</div>
                  <div>Expiry Date: {doc.expiryDate}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDocPreview(false)}>Close Preview</button>
              <button className="btn btn-primary" onClick={handleDownload}><Download size={14} /> Download PDF Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* RENEWAL LIFE-CYCLE DIALOG */}
      {showRenewalModal && (
        <div className="modal-overlay" onClick={() => setShowRenewalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Initiate Expiry Renewal Process</div>
            
            <form onSubmit={handleStartRenewal}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  This will transition the document status to <strong>RENEWAL IN PROGRESS</strong> and open a tracking card.
                </p>
                <div className="form-group">
                  <label className="form-label">Initiation Remarks *</label>
                  <textarea 
                    value={renewalRemarks}
                    onChange={(e) => setRenewalRemarks(e.target.value)}
                    placeholder="e.g. Submitting draft tax audit forms to department..."
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenewalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--purple)' }}>
                  <RefreshCw size={14} /> Trigger Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Simulated Close Icon
const X: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export default DocumentDetail;
