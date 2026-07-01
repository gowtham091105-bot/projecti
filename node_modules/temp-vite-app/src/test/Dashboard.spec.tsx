// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from '../modules/docsafe/api/Dashboard';
// Mock the useApp hook
vi.mock('../core/AppContext', () => {
  return {
    useApp: () => ({
      documents: [
        { id: 'doc_1', status: 'ACTIVE', title: 'Doc A', categoryId: 'cat_1', ownerUserId: 'usr_1', issueDate: '2026-01-01', expiryDate: '2027-01-01' },
        { id: 'doc_2', status: 'EXPIRED', title: 'Doc B', categoryId: 'cat_2', ownerUserId: 'usr_2', issueDate: '2025-01-01', expiryDate: '2026-01-01' },
        { id: 'doc_3', status: 'EXPIRING_SOON', title: 'Doc C', categoryId: 'cat_1', ownerUserId: 'usr_1', issueDate: '2026-01-01', expiryDate: '2026-07-15' },
      ],
      complianceItems: [
        { id: 'comp_1', status: 'MISSING', name: 'Obligation 1', linkedDocumentId: 'doc_1', severity: 'HIGH' },
      ],
      events: [],
      activeUser: { name: 'Tony Stark', role: 'Org Admin' },
      activeTenant: { name: 'Acme Corporation' },
    }),
  };
});

describe('Dashboard Component Unit Tests', () => {
  it('should render correct counts for documents and compliance status cards', () => {
    const setCurrentTab = vi.fn();
    const setSelectedDocId = vi.fn();

    render(
      <Dashboard 
        setCurrentTab={setCurrentTab} 
        setSelectedDocId={setSelectedDocId} 
      />
    );

    // Verify labels exist
    expect(screen.getByText('Total Documents')).toBeDefined();
    expect(screen.getByText('Active Documents')).toBeDefined();
    expect(screen.getByText('Expiring Soon')).toBeDefined();
    
    // Verify values exist
    // Total documents = 3
    expect(screen.getAllByText('3')).toBeDefined();
  });
});
