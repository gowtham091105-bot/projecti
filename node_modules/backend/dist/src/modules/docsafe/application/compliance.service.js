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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma.service");
const audit_service_1 = require("../../../core/audit/audit.service");
let ComplianceService = class ComplianceService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(tenantId, data, userName) {
        if (data.linkedDocumentId) {
            const doc = await this.prisma.document.findFirst({
                where: { id: data.linkedDocumentId, tenantId },
            });
            if (!doc) {
                throw new common_1.BadRequestException('Linked Document is invalid or belongs to another tenant.');
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
    async findAll(tenantId) {
        const list = await this.prisma.complianceItem.findMany({
            where: { tenantId },
            orderBy: { dueDate: 'asc' },
        });
        return {
            success: true,
            data: list,
        };
    }
    async findOne(tenantId, id) {
        const item = await this.prisma.complianceItem.findFirst({
            where: { id, tenantId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Compliance item not found');
        }
        return {
            success: true,
            data: item,
        };
    }
    async update(tenantId, id, data, userName) {
        const item = await this.prisma.complianceItem.findFirst({
            where: { id, tenantId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Compliance item not found');
        }
        if (data.linkedDocumentId) {
            const doc = await this.prisma.document.findFirst({
                where: { id: data.linkedDocumentId, tenantId },
            });
            if (!doc) {
                throw new common_1.BadRequestException('Linked Document is invalid or belongs to another tenant.');
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
    async remove(tenantId, id, userName) {
        const item = await this.prisma.complianceItem.findFirst({
            where: { id, tenantId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Compliance item not found');
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
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map