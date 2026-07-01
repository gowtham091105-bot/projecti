import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  async create(tenantId: string, name: string, description: string, isActive: boolean, userId: string, userName: string) {
    // Validate uniqueness within tenant
    const exists = await this.prisma.category.findFirst({
      where: {
        tenantId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
    if (exists) {
      throw new BadRequestException(`Category named "${name}" already exists for this tenant.`);
    }

    const category = await this.prisma.category.create({
      data: {
        tenantId,
        name,
        description,
        isActive,
        createdBy: userId,
      },
    });

    await this.audit.logEvent(tenantId, null, 'CATEGORY_CREATE', { name, isActive }, userName);

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll(tenantId: string) {
    const list = await this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return {
      success: true,
      data: list,
    };
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      data: category,
    };
  }

  async update(tenantId: string, id: string, name: string, description: string, isActive: boolean, userName: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!category) {
      throw new NotFoundException('Category not found or access denied');
    }

    // Validate name uniqueness if changed
    const conflict = await this.prisma.category.findFirst({
      where: {
        tenantId,
        id: { not: id },
        name: { equals: name, mode: 'insensitive' },
      },
    });
    if (conflict) {
      throw new BadRequestException(`Another category named "${name}" already exists.`);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
      },
    });

    await this.audit.logEvent(tenantId, null, 'CATEGORY_UPDATE', { id, name, oldActive: category.isActive, newActive: isActive }, userName);

    return {
      success: true,
      message: 'Category updated successfully',
      data: updated,
    };
  }

  async remove(tenantId: string, id: string, userName: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!category) {
      throw new NotFoundException('Category not found or access denied');
    }

    // Check if category is used by any document
    const docCount = await this.prisma.document.count({
      where: { categoryId: id },
    });
    if (docCount > 0) {
      throw new BadRequestException('Category is currently in use by documents and cannot be deleted. Deactivate it instead.');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    await this.audit.logEvent(tenantId, null, 'CATEGORY_DELETE', { id, name: category.name }, userName);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
