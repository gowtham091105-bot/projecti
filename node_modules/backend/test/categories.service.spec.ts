import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../src/modules/docsafe/application/categories.service';
import { PrismaService } from '../src/core/prisma.service';
import { AuditService } from '../src/core/audit/audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;
  let audit: AuditService;

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    document: {
      count: jest.fn(),
    },
    documentEvent: {
      create: jest.fn(),
    },
  };

  const mockAuditService = {
    logEvent: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully if it does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null); // No duplicate
      const createdCategory = { id: 'cat_1', name: 'License', isActive: true };
      prisma.category.create.mockResolvedValue(createdCategory);

      const result = await service.create(
        'tenant_1',
        'License',
        'Trade licenses',
        true,
        'usr_1',
        'Tony Stark'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant_1',
          name: 'License',
          description: 'Trade licenses',
          isActive: true,
          createdBy: 'usr_1',
        },
      });
      expect(audit.logEvent).toHaveBeenCalledWith(
        'tenant_1',
        null,
        'CATEGORY_CREATE',
        { name: 'License', isActive: true },
        'Tony Stark'
      );
    });

    it('should throw BadRequestException if category already exists', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat_1', name: 'License' });

      await expect(
        service.create('tenant_1', 'License', 'Trade licenses', true, 'usr_1', 'Tony Stark')
      ).rejects.toThrow(BadRequestException);

      expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category if it exists and is not in use by documents', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat_1', name: 'License' });
      prisma.document.count.mockResolvedValue(0); // Not in use
      prisma.category.delete.mockResolvedValue({});

      const result = await service.remove('tenant_1', 'cat_1', 'Tony Stark');

      expect(result.success).toBe(true);
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat_1' },
      });
      expect(audit.logEvent).toHaveBeenCalledWith(
        'tenant_1',
        null,
        'CATEGORY_DELETE',
        { id: 'cat_1', name: 'License' },
        'Tony Stark'
      );
    });

    it('should throw BadRequestException if category is in use by documents', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat_1', name: 'License' });
      prisma.document.count.mockResolvedValue(3); // In use

      await expect(
        service.remove('tenant_1', 'cat_1', 'Tony Stark')
      ).rejects.toThrow(BadRequestException);

      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if category is not found', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('tenant_1', 'cat_1', 'Tony Stark')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
