"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    await prisma.documentEvent.deleteMany({});
    await prisma.renewalRecord.deleteMany({});
    await prisma.complianceItem.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    const acme = await prisma.tenant.create({
        data: {
            id: 'tenant_acme',
            name: 'Acme Corporation',
            domain: 'acme.com',
        },
    });
    const stark = await prisma.tenant.create({
        data: {
            id: 'tenant_stark',
            name: 'Stark Industries',
            domain: 'stark.com',
        },
    });
    await prisma.user.createMany({
        data: [
            { id: 'usr_acme_admin', tenantId: acme.id, name: 'Tony Stark (Acme)', email: 'admin@acme.com', role: 'Org Admin' },
            { id: 'usr_acme_mgr', tenantId: acme.id, name: 'Bruce Banner (Acme)', email: 'manager@acme.com', role: 'Compliance Manager' },
            { id: 'usr_acme_viewer', tenantId: acme.id, name: 'Peter Parker (Acme)', email: 'viewer@acme.com', role: 'Viewer' },
            { id: 'usr_stark_admin', tenantId: stark.id, name: 'Pepper Potts (Stark)', email: 'admin@stark.com', role: 'Org Admin' },
            { id: 'usr_stark_uploader', tenantId: stark.id, name: 'Happy Hogan (Stark)', email: 'uploader@stark.com', role: 'Uploader' },
            { id: 'usr_stark_reviewer', tenantId: stark.id, name: 'Rhodey (Stark)', email: 'reviewer@stark.com', role: 'Reviewer' }
        ],
    });
    const acmeLic = await prisma.category.create({
        data: { id: 'cat_acme_lic', tenantId: acme.id, name: 'License', description: 'Government and trade licenses', isActive: true, createdBy: 'usr_acme_admin' },
    });
    const acmeTax = await prisma.category.create({
        data: { id: 'cat_acme_tax', tenantId: acme.id, name: 'Tax', description: 'Tax clearances and filings', isActive: true, createdBy: 'usr_acme_admin' },
    });
    const acmeIns = await prisma.category.create({
        data: { id: 'cat_acme_ins', tenantId: acme.id, name: 'Insurance', description: 'Liability and property insurance policy', isActive: true, createdBy: 'usr_acme_admin' },
    });
    const acmeAgr = await prisma.category.create({
        data: { id: 'cat_acme_agr', tenantId: acme.id, name: 'Agreement', description: 'NDAs and service agreements', isActive: true, createdBy: 'usr_acme_admin' },
    });
    const starkLic = await prisma.category.create({
        data: { id: 'cat_stark_lic', tenantId: stark.id, name: 'License', description: 'Tech manufacturing and defense licenses', isActive: true, createdBy: 'usr_stark_admin' },
    });
    const starkIns = await prisma.category.create({
        data: { id: 'cat_stark_ins', tenantId: stark.id, name: 'Insurance', description: 'Stark facility policies', isActive: true, createdBy: 'usr_stark_admin' },
    });
    const doc1 = await prisma.document.create({
        data: {
            id: 'doc_acme_001',
            tenantId: acme.id,
            categoryId: acmeLic.id,
            title: 'Commercial Trade License 2026',
            description: 'Primary trade license for Chennai corporate office',
            fileAssetId: 'asset_acme_001',
            fileName: 'trade_license_2026.pdf',
            fileSize: '1.8 MB',
            ownerUserId: 'usr_acme_admin',
            issueDate: new Date('2026-01-01'),
            expiryDate: new Date('2027-01-01'),
            renewalDueDate: new Date('2026-12-01'),
            status: 'ACTIVE',
            visibilityScope: 'Global',
            uploadedBy: 'usr_acme_admin',
        },
    });
    const doc2 = await prisma.document.create({
        data: {
            id: 'doc_acme_002',
            tenantId: acme.id,
            categoryId: acmeTax.id,
            title: 'Corporate Tax Assessment Q1',
            description: 'Q1 2026 verified tax clearance documentation',
            fileAssetId: 'asset_acme_002',
            fileName: 'tax_clearance_q1.pdf',
            fileSize: '4.2 MB',
            ownerUserId: 'usr_acme_mgr',
            issueDate: new Date('2026-02-10'),
            expiryDate: new Date('2026-06-30'),
            renewalDueDate: new Date('2026-06-15'),
            status: 'EXPIRING_SOON',
            visibilityScope: 'Finance Team',
            uploadedBy: 'usr_acme_mgr',
        },
    });
    const doc3 = await prisma.document.create({
        data: {
            id: 'doc_acme_003',
            tenantId: acme.id,
            categoryId: acmeIns.id,
            title: 'Facility Fire Insurance Policy',
            description: 'Expired safety insurance documentation. Renewal required.',
            fileAssetId: 'asset_acme_003',
            fileName: 'fire_insurance_25.pdf',
            fileSize: '3.1 MB',
            ownerUserId: 'usr_acme_admin',
            issueDate: new Date('2025-05-01'),
            expiryDate: new Date('2026-05-01'),
            renewalDueDate: new Date('2026-04-15'),
            status: 'EXPIRED',
            visibilityScope: 'HR & Admin',
            uploadedBy: 'usr_acme_admin',
        },
    });
    const doc4 = await prisma.document.create({
        data: {
            id: 'doc_acme_004',
            tenantId: acme.id,
            categoryId: acmeAgr.id,
            title: 'Vendor SLA Agreement - Microsoft',
            description: 'Azure hosting service level agreement renewal process initiated.',
            fileAssetId: 'asset_acme_004',
            fileName: 'microsoft_sla.pdf',
            fileSize: '2.9 MB',
            ownerUserId: 'usr_acme_mgr',
            issueDate: new Date('2025-06-12'),
            expiryDate: new Date('2026-06-12'),
            renewalDueDate: new Date('2026-05-12'),
            status: 'RENEWAL_IN_PROGRESS',
            visibilityScope: 'IT Infrastructure',
            uploadedBy: 'usr_acme_mgr',
        },
    });
    const doc5 = await prisma.document.create({
        data: {
            id: 'doc_acme_005',
            tenantId: acme.id,
            categoryId: acmeLic.id,
            title: 'NDT Compliance Certification',
            description: 'Missing actual physical document scan, marked as Missing.',
            fileAssetId: null,
            fileName: null,
            fileSize: null,
            ownerUserId: 'usr_acme_mgr',
            issueDate: new Date('2026-03-01'),
            expiryDate: new Date('2027-03-01'),
            renewalDueDate: new Date('2027-02-01'),
            status: 'MISSING',
            visibilityScope: 'Compliance Committee',
            uploadedBy: 'usr_acme_mgr',
        },
    });
    const doc6 = await prisma.document.create({
        data: {
            id: 'doc_stark_001',
            tenantId: stark.id,
            categoryId: starkLic.id,
            title: 'Arc Reactor Tech Import Permit',
            description: 'Federal approval for import of heavy core palladium parts',
            fileAssetId: 'asset_stark_001',
            fileName: 'arc_import_permit.pdf',
            fileSize: '5.4 MB',
            ownerUserId: 'usr_stark_admin',
            issueDate: new Date('2026-02-01'),
            expiryDate: new Date('2027-02-01'),
            renewalDueDate: new Date('2027-01-01'),
            status: 'ACTIVE',
            visibilityScope: 'Executive Circle',
            uploadedBy: 'usr_stark_admin',
        },
    });
    await prisma.complianceItem.createMany({
        data: [
            { id: 'comp_acme_001', tenantId: acme.id, categoryId: acmeLic.id, name: 'Annual Trade License Verification', linkedDocumentId: doc1.id, dueDate: new Date('2026-12-15'), severity: 'HIGH', status: 'COMPLIANT', notes: 'Ensure Trade License remains active. Verify with Municipal Corporation.' },
            { id: 'comp_acme_002', tenantId: acme.id, categoryId: acmeTax.id, name: 'Q1 Corporate Tax Filing', linkedDocumentId: doc2.id, dueDate: new Date('2026-06-30'), severity: 'MEDIUM', status: 'UNDER_REVIEW', notes: 'Final tax invoice validation by finance desk prior to closure.' },
            { id: 'comp_acme_003', tenantId: acme.id, categoryId: acmeIns.id, name: 'Facility Fire Safety Audit', linkedDocumentId: doc3.id, dueDate: new Date('2026-05-01'), severity: 'HIGH', status: 'EXPIRED', notes: 'Immediate hazard warning: policy has lapsed and fire audit is overdue!' },
            { id: 'comp_acme_004', tenantId: acme.id, categoryId: acmeAgr.id, name: 'Microsoft SLA Renewal Review', linkedDocumentId: doc4.id, dueDate: new Date('2026-06-12'), severity: 'MEDIUM', status: 'PENDING', notes: 'Review licensing tier and verify user counts before final sign-off.' },
            { id: 'comp_acme_005', tenantId: acme.id, categoryId: acmeLic.id, name: 'NDT Structural Certification Filing', linkedDocumentId: doc5.id, dueDate: new Date('2026-04-15'), severity: 'HIGH', status: 'MISSING', notes: 'No documentation uploaded for NDT testing of third-floor server deck.' },
            { id: 'comp_stark_001', tenantId: stark.id, categoryId: starkLic.id, name: 'Palladium Core Safety Audit', linkedDocumentId: doc6.id, dueDate: new Date('2026-11-20'), severity: 'HIGH', status: 'COMPLIANT', notes: 'Strict radiation and shield integrity inspection by J.A.R.V.I.S.' }
        ],
    });
    await prisma.renewalRecord.create({
        data: {
            id: 'ren_acme_001',
            tenantId: acme.id,
            documentId: doc4.id,
            initiatedBy: 'usr_acme_mgr',
            initiatedAt: new Date('2026-05-15T10:00:00Z'),
            stage: 'Quote Negotiation',
            remarks: 'Microsoft offered 5% volume discount. Awaiting finance confirmation.',
            status: 'IN_PROGRESS',
        },
    });
    await prisma.documentEvent.createMany({
        data: [
            { id: 'evt_001', tenantId: acme.id, documentId: doc1.id, eventType: 'DOCUMENT_CREATE', payloadJson: JSON.stringify({ title: 'Commercial Trade License 2026' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: new Date('2026-01-15T10:00:00Z') },
            { id: 'evt_002', tenantId: acme.id, documentId: doc1.id, eventType: 'FILE_UPLOAD', payloadJson: JSON.stringify({ fileName: 'trade_license_2026.pdf', size: '1.8 MB' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: new Date('2026-01-15T10:05:00Z') },
            { id: 'evt_003', tenantId: acme.id, documentId: doc3.id, eventType: 'DOCUMENT_EXPIRED', payloadJson: JSON.stringify({ title: 'Facility Fire Insurance Policy', expiredAt: '2026-05-01' }), triggeredBy: 'System Cron', triggeredAt: new Date('2026-05-01T23:59:59Z') },
            { id: 'evt_004', tenantId: acme.id, documentId: doc4.id, eventType: 'RENEWAL_INITIATED', payloadJson: JSON.stringify({ stage: 'Initiation', remarks: 'Azure SLA renewal project launched' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: new Date('2026-05-15T10:00:00Z') },
            { id: 'evt_005', tenantId: acme.id, documentId: doc2.id, eventType: 'COMPLIANCE_STATUS_UPDATE', payloadJson: JSON.stringify({ from: 'PENDING', to: 'UNDER_REVIEW' }), triggeredBy: 'Bruce Banner (Acme)', triggeredAt: new Date('2026-06-10T12:00:00Z') }
        ],
    });
    console.log('Database seeded successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map