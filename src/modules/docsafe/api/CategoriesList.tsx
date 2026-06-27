import React, { useState } from 'react';
import { Tags, Plus, Edit, Trash2, Power } from 'lucide-react';
import { useApp } from '../../../core/AppContext';

export const CategoriesList: React.FC = () => {
  const { 
    categories, 
    activeUser, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useApp();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');

  const isViewer = activeUser.role === 'Viewer';

  const handleOpenCreate = () => {
    setEditingCatId(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    setEditingCatId(id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleToggleActive = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    updateCategory(id, cat.name, cat.description || '', !cat.isActive);
  };

  const handleDelete = (id: string, catName: string) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      deleteCategory(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    let success = false;
    if (editingCatId) {
      success = updateCategory(editingCatId, name, description, isActive);
    } else {
      success = createCategory(name, description, isActive);
    }

    if (success) {
      setShowModal(false);
    }
  };

  return (
    <div>
      {/* Categories Toolbar */}
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <button 
          onClick={handleOpenCreate} 
          className="btn btn-primary"
          disabled={isViewer}
          title={isViewer ? "Viewer accounts cannot add categories" : "Create document category"}
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Grid/Table */}
      <div className="table-container">
        {categories.length === 0 ? (
          <div className="empty-state">
            <Tags className="empty-state-icon" />
            <h3 className="empty-state-title">No categories found</h3>
            <p>Create document categories to organize your metadata files.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cat.name}</div>
                  </td>
                  <td>{cat.description || <span style={{ color: 'var(--text-muted)' }}>No description provided</span>}</td>
                  <td>
                    {cat.isActive ? (
                      <span className="badge success">Active</span>
                    ) : (
                      <span className="badge danger">Deactivated</span>
                    )}
                  </td>
                  <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      {/* Activate/Deactivate Toggle */}
                      <button
                        className="btn-icon"
                        style={{ color: cat.isActive ? 'var(--danger)' : 'var(--success)' }}
                        onClick={() => handleToggleActive(cat.id)}
                        disabled={isViewer}
                        title={cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                      >
                        <Power size={16} />
                      </button>

                      <button 
                        className="btn-icon" 
                        onClick={() => handleOpenEdit(cat.id)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot edit" : "Edit category"}
                      >
                        <Edit size={16} />
                      </button>

                      <button 
                        className="btn-icon" 
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={isViewer}
                        title={isViewer ? "Viewer accounts cannot delete" : "Delete category"}
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

      {/* CREATE / EDIT DIALOG */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingCatId ? 'Edit Category' : 'Add Category'}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {errorMsg && <div className="badge danger" style={{ padding: '8px' }}>{errorMsg}</div>}

                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Agreement, Tax, License"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide short purpose of this category..."
                    className="form-control"
                    rows={3}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActive" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>
                    Mark as Active and usable
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategoriesList;
