import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../src/modules/docsafe/application/documents.service';
import { PrismaService } from '../src/core/prisma.service';
import { AuditService } from '../src/core/audit/audit.service';
import { StorageService } from '../src/core/storage/storage.service';
import { BadRequestException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: any;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
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
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if expiryDate is before issueDate', async () => {
      await expect(
        service.create(
          'tenant_1',
          {
            title: 'Test License',
            categoryId: 'cat_1',
            issueDate: '2026-02-01',
            expiryDate: '2026-01-01', // Expired issue boundary
            ownerUserId: 'usr_1',
          },
          'usr_1',
          'Tony Stark'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if renewalDueDate is after expiryDate', async () => {
      await expect(
        service.create(
          'tenant_1',
          {
            title: 'Test License',
            categoryId: 'cat_1',
            issueDate: '2026-01-01',
            expiryDate: '2026-06-01',
            renewalDueDate: '2026-07-01', // Renewal after expiry
            ownerUserId: 'usr_1',
          },
          'usr_1',
          'Tony Stark'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should create document successfully with correct inputs and check category', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat_1', name: 'License' });
      prisma.document.create.mockResolvedValue({ id: 'doc_1', title: 'Test License', status: 'MISSING' });

      const result = await service.create(
        'tenant_1',
        {
          title: 'Test License',
          categoryId: 'cat_1',
          issueDate: '2026-01-01',
          expiryDate: '2027-01-01',
          ownerUserId: 'usr_1',
        },
        'usr_1',
        'Tony Stark'
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('MISSING');
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat_1', tenantId: 'tenant_1' },
      });
    });
  });
});
