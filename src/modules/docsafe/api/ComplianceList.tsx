import React, { useState } from 'react';
import { ShieldAlert, Plus, Search, FilterX, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../../core/AppContext';
import { ComplianceStatus, Severity } from '../../../shared/enums/docsafe';

export const ComplianceList: React.FC = () => {
  const { 
    complianceItems, 
    documents, 
    categories,
    activeUser,
    createComplianceItem,
    updateComplianceItem,
    deleteComplianceItem
  } = useApp();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Form Fields State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [linkedDocId, setLinkedDocId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [severity, setSeverity] = useState<Severity>(Severity.MEDIUM);
  const [status, setStatus] = useState<ComplianceStatus>(ComplianceStatus.PENDING);
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');

  const isViewer = activeUser.role === 'Viewer';

  // Helpers
  const getDocTitle = (docId: string | null) => {
    if (!docId) return 'Unlinked / None';
    const doc = documents.find(d => d.id === docId);
    return doc ? doc.title : 'Deleted / Unknown';
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return 'N/A';
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  };

  const handleOpenCreate = () => {
    setEditingItemId(null);
    setName('');
    setCategoryId('');
    setLinkedDocId('');
    setDueDate('');
    setSeverity(Severity.MEDIUM);
    setStatus(ComplianceStatus.PENDING);
    setNotes('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (id: string) => {
    const item = complianceItems.find(c => c.id === id);
    if (!item) return;

    setEditingItemId(id);
    setName(item.name);
    setCategoryId(item.categoryId || '');
    setLinkedDocId(item.linkedDocumentId || '');
    setDueDate(item.dueDate || '');
    setSeverity(item.severity);
    setStatus(item.status);
    setNotes(item.notes || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete compliance item "${itemName}"?`)) {
      deleteComplianceItem(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Compliance requirement name is required.');
      return;
    }

    let success = false;
    const itemPayload = {
      name,
      categoryId: categoryId || null,
      linkedDocumentId: linkedDocId || null,
      dueDate: dueDate || null,
      severity,
      status,
      notes
    };

    if (editingItemId) {
      success = updateComplianceItem(editingItemId, itemPayload);
    } else {
      success = createComplianceItem(itemPayload);
    }

    if (success) {
      setShowFormModal(false);
    }
  };

  // Quick Inline Status Update
  const handleQuickStatusChange = (id: string, newStatus: ComplianceStatus) => {
    const item = complianceItems.find(c => c.id === id);
    if (!item) return;

    updateComplianceItem(id, {
      name: item.name,
      categoryId: item.categoryId,
      linkedDocumentId: item.linkedDocumentId,
      dueDate: item.dueDate,
      severity: item.severity,
      status: newStatus,
      notes: item.notes
    });
  };

  // Filter Logic
  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesSeverity = severityFilter ? item.severity === severityFilter : true;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusBadge = (s: ComplianceStatus) => {
    switch(s) {
      case ComplianceStatus.COMPLIANT:
        return <span className="badge success">Compliant</span>;
      case ComplianceStatus.PENDING:
        return <span className="badge warning">Pending</span>;
      case ComplianceStatus.MISSING:
        return <span className="badge danger">Missing</span>;
      case ComplianceStatus.EXPIRED:
        return <span className="badge danger">Expired</span>;
      case ComplianceStatus.UNDER_REVIEW:
        return <span className="badge info">Under Review</span>;
      default:
        return <span className="badge">{s}</span>;
    }
  };

  const getSeverityBadge = (sev: Severity) => {
    switch(sev) {
      case Severity.HIGH:
        return <span className="badge danger" style={{ fontSize: '10px' }}>High</span>;
      case Severity.MEDIUM:
        return <span className="badge warning" style={{ fontSize: '10px' }}>Medium</span>;
      case Severity.LOW:
        return <span className="badge info" style={{ fontSize: '10px' }}>Low</span>;
      default:
        return <span className="badge">{sev}</span>;
    }
  };

  return (
    <div>
      {/* Search and Filters Toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search compliance requirements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {Object.values(ComplianceStatus).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Severities</option>
            {Object.values(Severity).map(sev => (
              <option key={sev} value={sev}>{sev}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setSeverityFilter(''); }}
            className="btn btn-secondary"
            title="Reset Filters"
            style={{ padding: '10px 14px' }}
          >
            <FilterX size={16} />
          </button>
          
          <button 
            onClick={handleOpenCreate}
            className="btn btn-primary"
            disabled={isViewer}
            title={isViewer ? "Viewer accounts cannot add compliance items" : "Create compliance obligation"}
          >
            <Plus size={16} /> Add Compliance
          </button>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="table-container">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert className="empty-state-icon" />
            <h3 className="empty-state-title">No compliance items found</h3>
            <p>Try creating one or modifying your filters.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Compliance Name</th>
                <th>Category</th>
                <th>Linked Document</th>
                <th>Due Date</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Quick Update</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.notes && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.notes}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge info" style={{ fontWeight: 500 }}>
                      {getCategoryName(item.categoryId)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: item.linkedDocumentId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {getDocTitle(item.linkedDocumentId)}
                    </span>
                  </td>
                  <td>{item.dueDate || 'No Due Date'}</td>
                  <td>{getSeverityBadge(item.severity)}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleQuickStatusChange(item.id, e.target.value as ComplianceStatus)}
                      disabled={isViewer}
                      className="sim-select"
                      style={{ padding: '3px 6px', fontSize: '12px' }}
                    >
                      {Object.values(ComplianceStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleOpenEdit(item.id)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot edit" : "Edit Compliance details"}
                      >
                        <Edit size={16} />
                      </button>

                      <button 
                        className="btn-icon" 
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot delete" : "Delete Obligation"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingItemId ? 'Edit Compliance Requirement' : 'Add Compliance Requirement'}
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {formError && <div className="badge danger" style={{ padding: '8px' }}>{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Compliance Name *</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Annual Audit Filing"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.isActive).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Linked Document</label>
                  <select 
                    value={linkedDocId} 
                    onChange={(e) => setLinkedDocId(e.target.value)}
                    className="form-control"
                  >
                    <option value="">None / Unlinked</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select 
                      value={severity} 
                      onChange={(e) => setSeverity(e.target.value as Severity)}
                      className="form-control"
                    >
                      {Object.values(Severity).map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as ComplianceStatus)}
                      className="form-control"
                    >
                      {Object.values(ComplianceStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Obligation Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter compliance rules or criteria here..."
                    className="form-control"
                    rows={2}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Requirement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ComplianceList;
