import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';

@Injectable()
export class ComplianceService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  async create(
    tenantId: string,
    data: {
      name: string;
      categoryId: string | null;
      linkedDocumentId: string | null;
      dueDate: string | null;
      severity: string;
      status: string;
      notes?: string;
    },
    userName: string
  ) {
    // Validate document link is in same tenant
    if (data.linkedDocumentId) {
      const doc = await this.prisma.document.findFirst({
        where: { id: data.linkedDocumentId, tenantId },
      });
      if (!doc) {
        throw new BadRequestException('Linked Document is invalid or belongs to another tenant.');
      }
    }

    const item = await this.prisma.complianceItem.create({
      data: {
        tenantId,
        name: data.name,
        categoryId: data.categoryId,
        linkedDocumentId: data.linkedDocumentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        severity: data.severity,
        status: data.status,
        notes: data.notes,
      },
    });

    await this.audit.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_CREATE', { name: item.name }, userName);

    return {
      success: true,
      message: 'Compliance item created successfully',
      data: item,
    };
  }

  async findAll(tenantId: string) {
    const list = await this.prisma.complianceItem.findMany({
      where: { tenantId },
      orderBy: { dueDate: 'asc' },
    });
    return {
      success: true,
      data: list,
    };
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.complianceItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) {
      throw new NotFoundException('Compliance item not found');
    }
    return {
      success: true,
      data: item,
    };
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      name: string;
      categoryId: string | null;
      linkedDocumentId: string | null;
      dueDate: string | null;
      severity: string;
      status: string;
      notes?: string;
    },
    userName: string
  ) {
    const item = await this.prisma.complianceItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) {
      throw new NotFoundException('Compliance item not found');
    }

    if (data.linkedDocumentId) {
      const doc = await this.prisma.document.findFirst({
        where: { id: data.linkedDocumentId, tenantId },
      });
      if (!doc) {
        throw new BadRequestException('Linked Document is invalid or belongs to another tenant.');
      }
    }

    const updated = await this.prisma.complianceItem.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        linkedDocumentId: data.linkedDocumentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        severity: data.severity,
        status: data.status,
        notes: data.notes,
      },
    });

    await this.audit.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_UPDATE', { name: updated.name }, userName);
    if (item.status !== data.status) {
      await this.audit.logEvent(tenantId, data.linkedDocumentId, 'COMPLIANCE_STATUS_UPDATE', { from: item.status, to: data.status, name: updated.name }, userName);
    }

    return {
      success: true,
      message: 'Compliance item updated successfully',
      data: updated,
    };
  }

  async remove(tenantId: string, id: string, userName: string) {
    const item = await this.prisma.complianceItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) {
      throw new NotFoundException('Compliance item not found');
    }

    await this.prisma.complianceItem.delete({
      where: { id },
    });

    await this.audit.logEvent(tenantId, item.linkedDocumentId, 'COMPLIANCE_DELETE', { name: item.name }, userName);

    return {
      success: true,
      message: 'Compliance item deleted successfully',
    };
  }
}
