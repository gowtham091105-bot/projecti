import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { StorageService } from '../../../core/storage/storage.service';
export declare class DocumentsService {
    private prisma;
    private audit;
    private storage;
    constructor(prisma: PrismaService, audit: AuditService, storage: StorageService);
    private calculateStatus;
    create(tenantId: string, data: {
        title: string;
        categoryId: string;
        description?: string;
        ownerUserId: string;
        issueDate: string;
        expiryDate: string;
        renewalDueDate?: string;
        visibilityScope?: string;
    }, userId: string, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tenantId: string;
            title: string;
            fileAssetId: string | null;
            fileName: string | null;
            fileSize: string | null;
            ownerUserId: string;
            issueDate: Date;
            expiryDate: Date;
            renewalDueDate: Date | null;
            status: string;
            visibilityScope: string | null;
            uploadedBy: string;
            categoryId: string;
        };
    }>;
    findAll(tenantId: string): Promise<{
        success: boolean;
        data: ({
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                createdBy: string;
                tenantId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tenantId: string;
            title: string;
            fileAssetId: string | null;
            fileName: string | null;
            fileSize: string | null;
            ownerUserId: string;
            issueDate: Date;
            expiryDate: Date;
            renewalDueDate: Date | null;
            status: string;
            visibilityScope: string | null;
            uploadedBy: string;
            categoryId: string;
        })[];
    }>;
    findOne(tenantId: string, id: string): Promise<{
        success: boolean;
        data: {
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                createdBy: string;
                tenantId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tenantId: string;
            title: string;
            fileAssetId: string | null;
            fileName: string | null;
            fileSize: string | null;
            ownerUserId: string;
            issueDate: Date;
            expiryDate: Date;
            renewalDueDate: Date | null;
            status: string;
            visibilityScope: string | null;
            uploadedBy: string;
            categoryId: string;
        };
    }>;
    update(tenantId: string, id: string, data: {
        title: string;
        categoryId: string;
        description?: string;
        ownerUserId: string;
        issueDate: string;
        expiryDate: string;
        renewalDueDate?: string;
        visibilityScope?: string;
        status?: string;
    }, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tenantId: string;
            title: string;
            fileAssetId: string | null;
            fileName: string | null;
            fileSize: string | null;
            ownerUserId: string;
            issueDate: Date;
            expiryDate: Date;
            renewalDueDate: Date | null;
            status: string;
            visibilityScope: string | null;
            uploadedBy: string;
            categoryId: string;
        };
    }>;
    uploadFile(tenantId: string, id: string, fileName: string, fileBuffer: Buffer, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tenantId: string;
            title: string;
            fileAssetId: string | null;
            fileName: string | null;
            fileSize: string | null;
            ownerUserId: string;
            issueDate: Date;
            expiryDate: Date;
            renewalDueDate: Date | null;
            status: string;
            visibilityScope: string | null;
            uploadedBy: string;
            categoryId: string;
        };
    }>;
    downloadFile(tenantId: string, id: string): Promise<{
        filePath: string;
        fileName: string;
    }>;
    remove(tenantId: string, id: string, userName: string): Promise<{
        success: boolean;
        message: string;
    }>;
    initiateRenewal(tenantId: string, id: string, remarks: string, userId: string, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            tenantId: string;
            status: string;
            initiatedBy: string;
            initiatedAt: Date;
            stage: string;
            remarks: string | null;
            completedAt: Date | null;
            documentId: string;
        };
    }>;
    getHistory(tenantId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            tenantId: string;
            documentId: string | null;
            eventType: string;
            payloadJson: string | null;
            triggeredBy: string;
            triggeredAt: Date;
        }[];
    }>;
}
