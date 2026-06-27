import React, { useState } from 'react';
import { Clock, Search, FilterX, Eye, RefreshCw } from 'lucide-react';
import { useApp } from '../../../core/AppContext';
import { DocumentStatus, RenewalStatus } from '../../../shared/enums/docsafe';

interface ExpiringSoonListProps {
  setCurrentTab: (tab: string) => void;
  setSelectedDocId: (id: string | null) => void;
}

export const ExpiringSoonList: React.FC<ExpiringSoonListProps> = ({ setCurrentTab, setSelectedDocId }) => {
  const { 
    documents, 
    categories, 
    users, 
    activeUser, 
    renewalRecords,
    initiateRenewal 
  } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState<number>(30); // 7, 15, 30 days

  // Renewal Modal
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedDocIdForRenewal, setSelectedDocIdForRenewal] = useState<string | null>(null);
  const [renewalRemarks, setRenewalRemarks] = useState('');

  const isViewer = activeUser.role === 'Viewer';

  // Helper calculations
  const getDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    // Reset hours to get correct day count
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0,0,0,0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  };

  const getUserName = (usrId: string) => {
    const usr = users.find(u => u.id === usrId);
    return usr ? usr.name : 'Unassigned';
  };

  const handleOpenRenewal = (id: string) => {
    setSelectedDocIdForRenewal(id);
    setRenewalRemarks('');
    setShowRenewalModal(true);
  };

  const handleStartRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocIdForRenewal || !renewalRemarks.trim()) return;

    const success = initiateRenewal(selectedDocIdForRenewal, renewalRemarks);
    if (success) {
      setShowRenewalModal(false);
      setSelectedDocIdForRenewal(null);
      setRenewalRemarks('');
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedDocId(id);
    setCurrentTab('doc-detail');
  };

  // Filter Logic:
  // Show documents that have expired OR whose days left is <= daysFilter and are not already in RENEWAL_IN_PROGRESS/ARCHIVED.
  const expiringDocs = documents.filter(doc => {
    if (doc.status === DocumentStatus.ARCHIVED || doc.status === DocumentStatus.MISSING) {
      return false;
    }

    const daysLeft = getDaysLeft(doc.expiryDate);
    
    // Check if expired OR expiring within the selected window
    const matchesExpiringCriteria = daysLeft <= daysFilter || doc.status === DocumentStatus.EXPIRED;
    
    if (!matchesExpiringCriteria) return false;

    // Search and Category filters
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? doc.categoryId === categoryFilter : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Search and Filters Toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search expiring documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Days Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Urgency Window:</span>
            <select 
              value={daysFilter} 
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="filter-select"
            >
              <option value={7}>7 Days Left</option>
              <option value={15}>15 Days Left</option>
              <option value={30}>30 Days Left</option>
              <option value={90}>90 Days Left</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => { setSearchTerm(''); setCategoryFilter(''); setDaysFilter(30); }}
          className="btn btn-secondary"
          title="Reset Filters"
          style={{ padding: '10px 14px' }}
        >
          <FilterX size={16} /> Reset
        </button>
      </div>

      {/* Expiring Soon Table */}
      <div className="table-container">
        {expiringDocs.length === 0 ? (
          <div className="empty-state">
            <Clock className="empty-state-icon" style={{ color: 'var(--success)' }} />
            <h3 className="empty-state-title">No immediate renewals needed</h3>
            <p>All documents are compliant and fall outside the selected {daysFilter}-day window.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expiringDocs.map((doc) => {
                const daysLeft = getDaysLeft(doc.expiryDate);
                const isExpired = daysLeft < 0 || doc.status === DocumentStatus.EXPIRED;
                
                // Active renewals check
                const docRenewals = renewalRecords.filter(r => r.documentId === doc.id);
                const isRenewalActive = docRenewals.some(r => r.status === RenewalStatus.IN_PROGRESS);

                return (
                  <tr key={doc.id} style={{ borderLeft: isExpired ? '3px solid var(--danger)' : '3px solid var(--warning)' }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.title}</div>
                      {doc.fileName && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📎 {doc.fileName}</span>}
                    </td>
                    <td>
                      <span className="badge info">{getCategoryName(doc.categoryId)}</span>
                    </td>
                    <td>{getUserName(doc.ownerUserId)}</td>
                    <td>{doc.expiryDate}</td>
                    <td>
                      {isExpired ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                          Expired ({Math.abs(daysLeft)} days ago)
                        </span>
                      ) : (
                        <span style={{ color: daysLeft <= 7 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                          {daysLeft} days left
                        </span>
                      )}
                    </td>
                    <td>
                      {isRenewalActive ? (
                        <span className="badge info">Renewal In Progress</span>
                      ) : isExpired ? (
                        <span className="badge danger">Expired</span>
                      ) : (
                        <span className="badge warning">Expiring Soon</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleViewDetails(doc.id)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {!isRenewalActive && doc.status !== DocumentStatus.RENEWAL_IN_PROGRESS && (
                          <button 
                            className="btn-icon" 
                            style={{ color: 'var(--purple)' }}
                            onClick={() => handleOpenRenewal(doc.id)}
                            disabled={isViewer}
                            title={isViewer ? "Viewer accounts cannot renew" : "Start Renewal Process"}
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* RENEWAL DIALOG */}
      {showRenewalModal && (
        <div className="modal-overlay" onClick={() => setShowRenewalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Initiate Expiry Renewal Process</div>
            
            <form onSubmit={handleStartRenewalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  This will log a renewal lifecycle record and set status to <strong>RENEWAL IN PROGRESS</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label">Initiation Remarks *</label>
                  <textarea 
                    value={renewalRemarks}
                    onChange={(e) => setRenewalRemarks(e.target.value)}
                    placeholder="e.g. Submitting renewal check and documentation to licensing authority..."
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenewalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--purple)' }}>
                  <RefreshCw size={14} /> Start Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExpiringSoonList;
