import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { StorageService } from '../../../core/storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private storage: StorageService
  ) {}

  private calculateStatus(expiryDate: Date, hasFile: boolean, currentStatus?: string): string {
    if (!hasFile) {
      return 'MISSING';
    }
    if (currentStatus === 'RENEWAL_IN_PROGRESS' || currentStatus === 'ARCHIVED') {
      return currentStatus;
    }

    const now = new Date();
    // Clear hours to compare days
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (expiry < now) {
      return 'EXPIRED';
    } else if (diffDays <= 30) {
      return 'EXPIRING_SOON';
    }
    return 'ACTIVE';
  }

  async create(
    tenantId: string,
    data: {
      title: string;
      categoryId: string;
      description?: string;
      ownerUserId: string;
      issueDate: string;
      expiryDate: string;
      renewalDueDate?: string;
      visibilityScope?: string;
    },
    userId: string,
    userName: string
  ) {
    const issue = new Date(data.issueDate);
    const expiry = new Date(data.expiryDate);

    // Validate dates
    if (expiry < issue) {
      throw new BadRequestException('Expiry date must be greater than or equal to issue date.');
    }
    if (data.renewalDueDate) {
      const renewal = new Date(data.renewalDueDate);
      if (renewal > expiry) {
        throw new BadRequestException('Renewal due date should not be later than expiry date.');
      }
    }

    // Verify category exists in tenant
    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) {
      throw new BadRequestException('Invalid category selected.');
    }

    // Set initial status to MISSING since no file is attached during metadata-only post
    const status = 'MISSING';

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        ownerUserId: data.ownerUserId,
        issueDate: issue,
        expiryDate: expiry,
        renewalDueDate: data.renewalDueDate ? new Date(data.renewalDueDate) : null,
        status,
        visibilityScope: data.visibilityScope || 'Global',
        uploadedBy: userId,
      },
    });

    await this.audit.logEvent(tenantId, document.id, 'DOCUMENT_CREATE', { title: document.title }, userName);

    return {
      success: true,
      message: 'Document created successfully',
      data: document,
    };
  }

  async findAll(tenantId: string) {
    const list = await this.prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return {
      success: true,
      data: list,
    };
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return {
      success: true,
      data: document,
    };
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      title: string;
      categoryId: string;
      description?: string;
      ownerUserId: string;
      issueDate: string;
      expiryDate: string;
      renewalDueDate?: string;
      visibilityScope?: string;
      status?: string;
    },
    userName: string
  ) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const issue = new Date(data.issueDate);
    const expiry = new Date(data.expiryDate);

    // Validate dates
    if (expiry < issue) {
      throw new BadRequestException('Expiry date must be greater than or equal to issue date.');
    }
    if (data.renewalDueDate) {
      const renewal = new Date(data.renewalDueDate);
      if (renewal > expiry) {
        throw new BadRequestException('Renewal due date should not be later than expiry date.');
      }
    }

    // Verify category exists in tenant
    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) {
      throw new BadRequestException('Invalid category selected.');
    }

    // Determine status
    const status = this.calculateStatus(
      expiry,
      !!document.fileAssetId,
      data.status || document.status
    );

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        ownerUserId: data.ownerUserId,
        issueDate: issue,
        expiryDate: expiry,
        renewalDueDate: data.renewalDueDate ? new Date(data.renewalDueDate) : null,
        status,
        visibilityScope: data.visibilityScope || 'Global',
      },
    });

    await this.audit.logEvent(tenantId, id, 'DOCUMENT_UPDATE', { title: updated.title }, userName);

    if (document.status !== status) {
      await this.audit.logEvent(tenantId, id, 'STATUS_CHANGE', { oldStatus: document.status, newStatus: status }, userName);
    }

    return {
      success: true,
      message: 'Document metadata updated successfully',
      data: updated,
    };
  }

  async uploadFile(
    tenantId: string,
    id: string,
    fileName: string,
    fileBuffer: Buffer,
    userName: string
  ) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Save actual file
    const { fileAssetId, sizeString } = await this.storage.saveFile(fileName, fileBuffer);

    // Auto-calculate new status
    const newStatus = this.calculateStatus(document.expiryDate, true, document.status);

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        fileAssetId,
        fileName,
        fileSize: sizeString,
        status: newStatus,
      },
    });

    await this.audit.logEvent(tenantId, id, 'FILE_UPLOAD', { fileName, fileSize: sizeString }, userName);
    if (document.status !== newStatus) {
      await this.audit.logEvent(tenantId, id, 'STATUS_CHANGE', { oldStatus: document.status, newStatus: newStatus }, userName);
    }

    // Auto update any linked compliance items that were MISSING to PENDING
    await this.prisma.complianceItem.updateMany({
      where: {
        tenantId,
        linkedDocumentId: id,
        status: 'MISSING',
      },
      data: {
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: 'File uploaded successfully',
      data: updated,
    };
  }

  async downloadFile(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document || !document.fileAssetId || !document.fileName) {
      throw new NotFoundException('File asset not found on this document record.');
    }

    const filePath = await this.storage.getFilePath(document.fileAssetId, document.fileName);
    return {
      filePath,
      fileName: document.fileName,
    };
  }

  async remove(tenantId: string, id: string, userName: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.delete({
      where: { id },
    });

    await this.audit.logEvent(tenantId, null, 'DOCUMENT_DELETE', { id, title: document.title }, userName);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  // --- RENEWALS LIFECYCLE ---
  async initiateRenewal(tenantId: string, id: string, remarks: string, userId: string, userName: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.status === 'RENEWAL_IN_PROGRESS') {
      throw new BadRequestException('Renewal is already in progress for this document.');
    }

    // 1. Update Document status
    const oldStatus = document.status;
    await this.prisma.document.update({
      where: { id },
      data: { status: 'RENEWAL_IN_PROGRESS' },
    });

    // 2. Create Renewal Record
    const renewal = await this.prisma.renewalRecord.create({
      data: {
        tenantId,
        documentId: id,
        initiatedBy: userId,
        stage: 'Initiated',
        remarks,
        status: 'IN_PROGRESS',
      },
    });

    await this.audit.logEvent(tenantId, id, 'RENEWAL_INITIATED', { stage: 'Initiated', remarks }, userName);
    await this.audit.logEvent(tenantId, id, 'STATUS_CHANGE', { oldStatus, newStatus: 'RENEWAL_IN_PROGRESS' }, userName);

    return {
      success: true,
      message: 'Renewal initiated successfully',
      data: renewal,
    };
  }

  async getHistory(tenantId: string, id: string) {
    const list = await this.prisma.documentEvent.findMany({
      where: { tenantId, documentId: id },
      orderBy: { triggeredAt: 'desc' },
    });
    return {
      success: true,
      data: list,
    };
  }
}
