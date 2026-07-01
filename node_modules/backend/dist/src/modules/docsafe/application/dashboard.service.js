"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(tenantId) {
        const [total, active, expiring, expired, missing, renewal] = await Promise.all([
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
    async getExpiringSoon(tenantId) {
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
    async getExpired(tenantId) {
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
    async getMissing(tenantId) {
        const list = await this.prisma.complianceItem.findMany({
            where: {
                tenantId,
                status: 'MISSING'
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: list };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map