import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchDocuments(
    tenantId: string,
    filters: {
      q?: string;
      categoryId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 5;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      tenantId,
    };

    if (filters.q) {
      whereClause.title = {
        contains: filters.q,
        mode: 'insensitive',
      };
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.expiryDate = {};
      if (filters.startDate) {
        whereClause.expiryDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.expiryDate.lte = new Date(filters.endDate);
      }
    }

    const [total, list] = await Promise.all([
      this.prisma.document.count({ where: whereClause }),
      this.prisma.document.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { category: true },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        list,
      },
    };
  }

  async searchCompliance(
    tenantId: string,
    filters: {
      q?: string;
      status?: string;
      severity?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      tenantId,
    };

    if (filters.q) {
      whereClause.name = {
        contains: filters.q,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.severity) {
      whereClause.severity = filters.severity;
    }

    const [total, list] = await Promise.all([
      this.prisma.complianceItem.count({ where: whereClause }),
      this.prisma.complianceItem.findMany({
        where: whereClause,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        list,
      },
    };
  }
}
