import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../src/modules/docsafe/application/categories.service';
import { DocumentsService } from '../src/modules/docsafe/application/documents.service';
import { PrismaService } from '../src/core/prisma.service';
import { AuditService } from '../src/core/audit/audit.service';
import { StorageService } from '../src/core/storage/storage.service';

describe('Tenant Isolation Verification', () => {
  let categoriesService: CategoriesService;
  let documentsService: DocumentsService;
  let prisma: any;

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    document: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    documentEvent: {
      create: jest.fn(),
    },
  };

  const mockAuditService = {
    logEvent: jest.fn().mockResolvedValue({}),
  };

  const mockStorageService = {
    saveFile: jest.fn(),
    getFilePath: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
    documentsService = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('CategoriesService.findAll must strictly filter queries by tenantId', async () => {
    prisma.category.findMany.mockResolvedValue([]);
    
    await categoriesService.findAll('tenant_acme');

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant_acme' },
      orderBy: { name: 'asc' },
    });
  });

  it('CategoriesService.findOne must strictly include tenantId in the query filters', async () => {
    prisma.category.findFirst.mockResolvedValue({ id: 'cat_1', tenantId: 'tenant_acme' });
    
    await categoriesService.findOne('tenant_acme', 'cat_1');

    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'cat_1', tenantId: 'tenant_acme' },
    });
  });

  it('DocumentsService.findAll must strictly filter queries by tenantId', async () => {
    prisma.document.findMany.mockResolvedValue([]);
    
    await documentsService.findAll('tenant_stark');

    expect(prisma.document.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant_stark' },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('DocumentsService.findOne must strictly filter queries by tenantId and documentId', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc_1', tenantId: 'tenant_stark' });
    
    await documentsService.findOne('tenant_stark', 'doc_1');

    expect(prisma.document.findFirst).toHaveBeenCalledWith({
      where: { id: 'doc_1', tenantId: 'tenant_stark' },
      include: { category: true },
    });
  });
});
