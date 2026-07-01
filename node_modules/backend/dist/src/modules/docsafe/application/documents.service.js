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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma.service");
const audit_service_1 = require("../../../core/audit/audit.service");
const storage_service_1 = require("../../../core/storage/storage.service");
let DocumentsService = class DocumentsService {
    prisma;
    audit;
    storage;
    constructor(prisma, audit, storage) {
        this.prisma = prisma;
        this.audit = audit;
        this.storage = storage;
    }
    calculateStatus(expiryDate, hasFile, currentStatus) {
        if (!hasFile) {
            return 'MISSING';
        }
        if (currentStatus === 'RENEWAL_IN_PROGRESS' || currentStatus === 'ARCHIVED') {
            return currentStatus;
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (expiry < now) {
            return 'EXPIRED';
        }
        else if (diffDays <= 30) {
            return 'EXPIRING_SOON';
        }
        return 'ACTIVE';
    }
    async create(tenantId, data, userId, userName) {
        const issue = new Date(data.issueDate);
        const expiry = new Date(data.expiryDate);
        if (expiry < issue) {
            throw new common_1.BadRequestException('Expiry date must be greater than or equal to issue date.');
        }
        if (data.renewalDueDate) {
            const renewal = new Date(data.renewalDueDate);
            if (renewal > expiry) {
                throw new common_1.BadRequestException('Renewal due date should not be later than expiry date.');
            }
        }
        const category = await this.prisma.category.findFirst({
            where: { id: data.categoryId, tenantId },
        });
        if (!category) {
            throw new common_1.BadRequestException('Invalid category selected.');
        }
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
    async findAll(tenantId) {
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
    async findOne(tenantId, id) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
            include: { category: true },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return {
            success: true,
            data: document,
        };
    }
    async update(tenantId, id, data, userName) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const issue = new Date(data.issueDate);
        const expiry = new Date(data.expiryDate);
        if (expiry < issue) {
            throw new common_1.BadRequestException('Expiry date must be greater than or equal to issue date.');
        }
        if (data.renewalDueDate) {
            const renewal = new Date(data.renewalDueDate);
            if (renewal > expiry) {
                throw new common_1.BadRequestException('Renewal due date should not be later than expiry date.');
            }
        }
        const category = await this.prisma.category.findFirst({
            where: { id: data.categoryId, tenantId },
        });
        if (!category) {
            throw new common_1.BadRequestException('Invalid category selected.');
        }
        const status = this.calculateStatus(expiry, !!document.fileAssetId, data.status || document.status);
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
    async uploadFile(tenantId, id, fileName, fileBuffer, userName) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const { fileAssetId, sizeString } = await this.storage.saveFile(fileName, fileBuffer);
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
    async downloadFile(tenantId, id) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        if (!document || !document.fileAssetId || !document.fileName) {
            throw new common_1.NotFoundException('File asset not found on this document record.');
        }
        const filePath = await this.storage.getFilePath(document.fileAssetId, document.fileName);
        return {
            filePath,
            fileName: document.fileName,
        };
    }
    async remove(tenantId, id, userName) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
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
    async initiateRenewal(tenantId, id, remarks, userId, userName) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (document.status === 'RENEWAL_IN_PROGRESS') {
            throw new common_1.BadRequestException('Renewal is already in progress for this document.');
        }
        const oldStatus = document.status;
        await this.prisma.document.update({
            where: { id },
            data: { status: 'RENEWAL_IN_PROGRESS' },
        });
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
    async getHistory(tenantId, id) {
        const list = await this.prisma.documentEvent.findMany({
            where: { tenantId, documentId: id },
            orderBy: { triggeredAt: 'desc' },
        });
        return {
            success: true,
            data: list,
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        storage_service_1.StorageService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map