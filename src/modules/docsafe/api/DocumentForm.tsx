import React, { useState, useEffect } from 'react';
import { Save, X, Upload, File } from 'lucide-react';
import { useApp } from '../../../core/AppContext';

interface DocumentFormProps {
  editDocId: string | null;
  setCurrentTab: (tab: string) => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ editDocId, setCurrentTab }) => {
  const { 
    categories, 
    users, 
    documents, 
    createDocument, 
    updateDocument 
  } = useApp();

  const isEditMode = !!editDocId;
  const targetDoc = isEditMode ? documents.find(d => d.id === editDocId) : null;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalDueDate, setRenewalDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [visibilityScope, setVisibilityScope] = useState('Global');
  
  // File state (simulated)
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);

  // Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load target document if in edit mode
  useEffect(() => {
    if (isEditMode && targetDoc) {
      setTitle(targetDoc.title);
      setCategoryId(targetDoc.categoryId);
      setOwnerUserId(targetDoc.ownerUserId);
      setIssueDate(targetDoc.issueDate);
      setExpiryDate(targetDoc.expiryDate);
      setRenewalDueDate(targetDoc.renewalDueDate || '');
      setDescription(targetDoc.description || '');
      setVisibilityScope(targetDoc.visibilityScope || 'Global');
      if (targetDoc.fileName) {
        setSelectedFile({ name: targetDoc.fileName, size: targetDoc.fileSize || 'Unknown' });
      }
    } else {
      // Defaults for Create mode
      setTitle('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setOwnerUserId(users.length > 0 ? users[0].id : '');
      setIssueDate(new Date().toISOString().split('T')[0]);
      // Default expiry is 1 year from now
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      setExpiryDate(oneYear.toISOString().split('T')[0]);
      // Default renewal is 30 days before expiry
      const renewalDate = new Date(oneYear);
      renewalDate.setDate(renewalDate.getDate() - 30);
      setRenewalDueDate(renewalDate.toISOString().split('T')[0]);
      setDescription('');
      setVisibilityScope('Global');
      setSelectedFile(null);
    }
    setErrors({});
  }, [editDocId, targetDoc, isEditMode, categories, users]);

  // Handle file select simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeInMB = file.size / (1024 * 1024);
      
      if (sizeInMB > 10.0) {
        setErrors(prev => ({ ...prev, file: 'File exceeds the maximum limit of 10MB.' }));
        setSelectedFile(null);
      } else {
        setSelectedFile({
          name: file.name,
          size: `${sizeInMB.toFixed(2)} MB`
        });
        setErrors(prev => {
          const copy = { ...prev };
          delete copy.file;
          return copy;
        });
      }
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // 1. Check required inputs
    if (!title.trim()) newErrors.title = 'Document title is required.';
    if (!categoryId) newErrors.categoryId = 'Document category is required.';
    if (!issueDate) newErrors.issueDate = 'Issue date is required.';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required.';
    if (!isEditMode && !selectedFile) newErrors.file = 'Please upload a file to proceed.';

    // 2. Validate dates
    if (issueDate && expiryDate) {
      const issue = new Date(issueDate);
      const expiry = new Date(expiryDate);
      if (expiry < issue) {
        newErrors.expiryDate = 'Expiry date must be greater than or equal to issue date.';
      }
    }

    if (renewalDueDate && expiryDate) {
      const renewal = new Date(renewalDueDate);
      const expiry = new Date(expiryDate);
      if (renewal > expiry) {
        newErrors.renewalDueDate = 'Renewal due date should not be later than expiry date.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 3. Save to database
    let success = false;
    if (isEditMode && targetDoc) {
      success = updateDocument(targetDoc.id, {
        title,
        categoryId,
        description,
        ownerUserId,
        issueDate,
        expiryDate,
        renewalDueDate: renewalDueDate || undefined,
        visibilityScope,
        status: targetDoc.status // Preserve existing status or let backend calculate
      });
    } else {
      success = createDocument({
        title,
        categoryId,
        description,
        ownerUserId,
        issueDate,
        expiryDate,
        renewalDueDate: renewalDueDate || undefined,
        visibilityScope,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size
      });
    }

    if (success) {
      setCurrentTab('documents');
    }
  };

  return (
    <div className="form-card">
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {isEditMode ? 'Edit Document Details' : 'Add New Document to System'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Title field */}
          <div className="form-group form-grid-full">
            <label className="form-label">Document Title *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GST Registration Certificate"
              className="form-control"
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label">Category *</label>
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
            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          </div>

          {/* Owner Dropdown */}
          <div className="form-group">
            <label className="form-label">Document Owner</label>
            <select 
              value={ownerUserId} 
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="form-control"
            >
              <option value="">Select User</option>
              {users.map(usr => (
                <option key={usr.id} value={usr.id}>{usr.name} ({usr.role})</option>
              ))}
            </select>
          </div>

          {/* Issue Date */}
          <div className="form-group">
            <label className="form-label">Issue Date *</label>
            <input 
              type="date" 
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="form-control"
            />
            {errors.issueDate && <span className="form-error">{errors.issueDate}</span>}
          </div>

          {/* Expiry Date */}
          <div className="form-group">
            <label className="form-label">Expiry Date *</label>
            <input 
              type="date" 
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="form-control"
            />
            {errors.expiryDate && <span className="form-error">{errors.expiryDate}</span>}
          </div>

          {/* Renewal Due Date */}
          <div className="form-group">
            <label className="form-label">Renewal Due Date</label>
            <input 
              type="date" 
              value={renewalDueDate}
              onChange={(e) => setRenewalDueDate(e.target.value)}
              className="form-control"
            />
            {errors.renewalDueDate && <span className="form-error">{errors.renewalDueDate}</span>}
          </div>

          {/* Visibility Scope */}
          <div className="form-group">
            <label className="form-label">Visibility Scope</label>
            <select 
              value={visibilityScope} 
              onChange={(e) => setVisibilityScope(e.target.value)}
              className="form-control"
            >
              <option value="Global">Global / Public</option>
              <option value="Executive Circle">Executive Circle</option>
              <option value="HR & Admin">HR & Admin Only</option>
              <option value="Finance Team">Finance Team Only</option>
              <option value="IT Infrastructure">IT Infrastructure Only</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group form-grid-full">
            <label className="form-label">Description / Remarks</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide brief context for this document compliance obligation..."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* File Upload zone */}
          <div className="form-group form-grid-full">
            <label className="form-label">File Asset Attachment *</label>
            
            {selectedFile ? (
              <div className="file-info-block" style={{ marginTop: '0' }}>
                <div className="file-info-left">
                  <File className="file-icon" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedFile.size}</div>
                  </div>
                </div>
                {!isEditMode && (
                  <button 
                    type="button" 
                    className="btn-icon" 
                    onClick={() => setSelectedFile(null)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <label className="file-upload-zone">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Upload className="file-upload-icon" />
                <div style={{ fontWeight: 600 }}>Click to browse your local device</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Supported Formats: PDF, PNG, JPG, JPEG (Max 10MB)
                </div>
              </label>
            )}
            {errors.file && <span className="form-error" style={{ display: 'block', marginTop: '6px' }}>{errors.file}</span>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => setCurrentTab('documents')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            <Save size={16} /> {isEditMode ? 'Update Document' : 'Save Document'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default DocumentForm;
