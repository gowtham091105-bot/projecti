import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const [
      total,
      active,
      expiring,
      expired,
      missing,
      renewal
    ] = await Promise.all([
      this.prisma.document.count({ where: { tenantId } }),
      this.prisma.document.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.document.count({ where: { tenantId, status: 'EXPIRING_SOON' } }),
      this.prisma.document.count({ where: { tenantId, status: 'EXPIRED' } }),
      this.prisma.complianceItem.count({ where: { tenantId, status: 'MISSING' } }),
      this.prisma.document.count({ where: { tenantId, status: 'RENEWAL_IN_PROGRESS' } })
    ]);

    const recentEvents = await this.prisma.documentEvent.findMany({
      where: { tenantId },
      orderBy: { triggeredAt: 'desc' },
      take: 10
    });

    return {
      success: true,
      data: {
        total,
        active,
        expiring,
        expired,
        missing,
        renewal,
        recentEvents
      }
    };
  }

  async getExpiringSoon(tenantId: string) {
    const list = await this.prisma.document.findMany({
      where: {
        tenantId,
        status: 'EXPIRING_SOON'
      },
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });
    return { success: true, data: list };
  }

  async getExpired(tenantId: string) {
    const list = await this.prisma.document.findMany({
      where: {
        tenantId,
        status: 'EXPIRED'
      },
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });
    return { success: true, data: list };
  }

  async getMissing(tenantId: string) {
    const list = await this.prisma.complianceItem.findMany({
      where: {
        tenantId,
        status: 'MISSING'
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: list };
  }
}
