import React, { useState } from 'react';
import { Search, Plus, FilterX, Eye, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../../core/AppContext';
import { DocumentStatus } from '../../../shared/enums/docsafe';

interface DocumentsListProps {
  setCurrentTab: (tab: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setEditDocId: (id: string | null) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ 
  setCurrentTab, 
  setSelectedDocId,
  setEditDocId 
}) => {
  const { documents, categories, users, activeUser, deleteDocument } = useApp();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Check RBAC permissions: Viewers cannot create/edit/delete documents
  const isViewer = activeUser.role === 'Viewer';

  // Helper to map Category ID to Name
  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  };

  // Helper to map User ID to Name
  const getUserName = (usrId: string) => {
    const usr = users.find(u => u.id === usrId);
    return usr ? usr.name : 'System / Unassigned';
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setDateStartFilter('');
    setDateEndFilter('');
    setCurrentPage(1);
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    // Title search
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter ? doc.categoryId === categoryFilter : true;
    
    // Status filter
    const matchesStatus = statusFilter ? doc.status === statusFilter : true;
    
    // Expiry date range filter
    let matchesDate = true;
    if (dateStartFilter) {
      matchesDate = matchesDate && new Date(doc.expiryDate) >= new Date(dateStartFilter);
    }
    if (dateEndFilter) {
      matchesDate = matchesDate && new Date(doc.expiryDate) <= new Date(dateEndFilter);
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalItems = filteredDocs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedDocId(id);
    setCurrentTab('doc-detail');
  };

  const handleEdit = (id: string) => {
    setEditDocId(id);
    setCurrentTab('doc-form');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will also clean compliance linkages.`)) {
      deleteDocument(id);
      // Ensure we adjust page if items decrease
      const updatedTotal = totalItems - 1;
      const updatedPages = Math.ceil(updatedTotal / itemsPerPage) || 1;
      if (currentPage > updatedPages) {
        setCurrentPage(updatedPages);
      }
    }
  };

  const handleAddDocument = () => {
    setEditDocId(null);
    setCurrentTab('doc-form');
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
      {/* Search and Filters Toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          {/* Title search */}
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search by document title..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="search-input"
            />
          </div>

          {/* Category Dropdown */}
          <select 
            value={categoryFilter} 
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {Object.values(DocumentStatus).map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Expiry Date filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expiry:</span>
            <input 
              type="date" 
              value={dateStartFilter}
              onChange={(e) => { setDateStartFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
              style={{ padding: '8px 10px' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
            <input 
              type="date" 
              value={dateEndFilter}
              onChange={(e) => { setDateEndFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
              style={{ padding: '8px 10px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleResetFilters}
            className="btn btn-secondary"
            title="Reset Filters"
            style={{ padding: '10px 14px' }}
          >
            <FilterX size={16} />
          </button>
          
          <button 
            onClick={handleAddDocument}
            className="btn btn-primary"
            disabled={isViewer}
            title={isViewer ? "Viewer accounts cannot upload documents" : "Create New Document"}
          >
            <Plus size={16} /> Add Document
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        {paginatedDocs.length === 0 ? (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3 className="empty-state-title">No documents found</h3>
            <p>Try resetting filters or search query to find your items.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{doc.title}</div>
                    {doc.fileName && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        📎 {doc.fileName} ({doc.fileSize})
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge info" style={{ fontWeight: 500 }}>
                      {getCategoryName(doc.categoryId)}
                    </span>
                  </td>
                  <td>{getUserName(doc.ownerUserId)}</td>
                  <td>{doc.issueDate}</td>
                  <td>{doc.expiryDate}</td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleViewDetails(doc.id)}
                        title="View Document Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEdit(doc.id)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot edit" : "Edit Metadata"}
                      >
                        <Edit size={16} />
                      </button>

                      <button 
                        className="btn-icon" 
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot delete" : "Delete Document"}
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

        {/* Pagination Section */}
        {totalItems > 0 && (
          <div className="pagination">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> entries
            </span>

            <div className="pagination-numbers">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DocumentsList;
