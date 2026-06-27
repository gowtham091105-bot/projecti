import React, { useState } from 'react';
import { History, Search, FilterX } from 'lucide-react';
import { useApp } from '../../../core/AppContext';

export const AuditLogsList: React.FC = () => {
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(evt => {
    const term = searchTerm.toLowerCase();
    const matchesActor = evt.triggeredBy.toLowerCase().includes(term);
    const matchesType = evt.eventType.toLowerCase().includes(term);
    
    let matchesPayload = false;
    try {
      if (evt.payloadJson) {
        matchesPayload = evt.payloadJson.toLowerCase().includes(term);
      }
    } catch(e) {}

    return matchesActor || matchesType || matchesPayload;
  });

  return (
    <div>
      {/* Search toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          <div className="search-input-wrapper" style={{ minWidth: '320px' }}>
            <Search className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search by action event, document title, or actor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <button 
          onClick={() => setSearchTerm('')}
          className="btn btn-secondary"
          title="Reset Search"
          style={{ padding: '10px 14px' }}
        >
          <FilterX size={16} /> Reset
        </button>
      </div>

      {/* Events Table */}
      <div className="table-container">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <History className="empty-state-icon" />
            <h3 className="empty-state-title">No audit records found</h3>
            <p>Make edits, upload files, or perform renewals to see history build up.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Action Event Type</th>
                <th>Activity Description / Details</th>
                <th>Triggered By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(evt => {
                let details = '';
                try {
                  const payload = evt.payloadJson ? JSON.parse(evt.payloadJson) : {};
                  if (payload.title) details = `Doc: "${payload.title}"`;
                  else if (payload.name) details = `Category/Obligation: "${payload.name}"`;
                  else if (payload.fileName) details = `File Upload: "${payload.fileName}" (${payload.size || 'N/A'})`;
                  else if (payload.oldActive !== undefined) details = `Active state toggle: ${payload.oldActive ? 'Active' : 'Inactive'} -> ${payload.newActive ? 'Active' : 'Inactive'}`;
                  else if (payload.from && payload.to) details = `Status transition: ${payload.from} ➔ ${payload.to}`;
                  else if (payload.stage) details = `Renewal stage: "${payload.stage}" (${payload.remarks || 'No remarks'})`;
                  else if (payload.extendedTo) details = `Validity extended to: ${payload.extendedTo}`;
                } catch(err) {
                  details = evt.payloadJson || '';
                }

                // Determine badge color
                let badgeClass = 'info';
                if (evt.eventType.includes('CREATE')) badgeClass = 'success';
                if (evt.eventType.includes('UPLOAD')) badgeClass = 'success';
                if (evt.eventType.includes('DELETE')) badgeClass = 'danger';
                if (evt.eventType.includes('EXPIRED')) badgeClass = 'danger';
                if (evt.eventType.includes('RENEWAL')) badgeClass = 'purple';
                if (evt.eventType.includes('STATUS')) badgeClass = 'warning';

                return (
                  <tr key={evt.id}>
                    <td>
                      <span className={`badge ${badgeClass}`} style={{ fontWeight: 600 }}>
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{details || <span style={{ color: 'var(--text-muted)' }}>No extra data</span>}</td>
                    <td>{evt.triggeredBy}</td>
                    <td>{new Date(evt.triggeredAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default AuditLogsList;
