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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchDocuments(tenantId, filters) {
        const page = filters.page ? Number(filters.page) : 1;
        const limit = filters.limit ? Number(filters.limit) : 5;
        const skip = (page - 1) * limit;
        const whereClause = {
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
    async searchCompliance(tenantId, filters) {
        const page = filters.page ? Number(filters.page) : 1;
        const limit = filters.limit ? Number(filters.limit) : 10;
        const skip = (page - 1) * limit;
        const whereClause = {
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
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map