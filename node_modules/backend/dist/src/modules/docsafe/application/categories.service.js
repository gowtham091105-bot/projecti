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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma.service");
const audit_service_1 = require("../../../core/audit/audit.service");
let CategoriesService = class CategoriesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(tenantId, name, description, isActive, userId, userName) {
        const exists = await this.prisma.category.findFirst({
            where: {
                tenantId,
                name: { equals: name, mode: 'insensitive' },
            },
        });
        if (exists) {
            throw new common_1.BadRequestException(`Category named "${name}" already exists for this tenant.`);
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
    async findAll(tenantId) {
        const list = await this.prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        return {
            success: true,
            data: list,
        };
    }
    async findOne(tenantId, id) {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return {
            success: true,
            data: category,
        };
    }
    async update(tenantId, id, name, description, isActive, userName) {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found or access denied');
        }
        const conflict = await this.prisma.category.findFirst({
            where: {
                tenantId,
                id: { not: id },
                name: { equals: name, mode: 'insensitive' },
            },
        });
        if (conflict) {
            throw new common_1.BadRequestException(`Another category named "${name}" already exists.`);
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
    async remove(tenantId, id, userName) {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found or access denied');
        }
        const docCount = await this.prisma.document.count({
            where: { categoryId: id },
        });
        if (docCount > 0) {
            throw new common_1.BadRequestException('Category is currently in use by documents and cannot be deleted. Deactivate it instead.');
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map