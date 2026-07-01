import { DocumentsService } from '../application/documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    create(req: any, title: string, categoryId: string, description: string, ownerUserId: string, issueDate: string, expiryDate: string, renewalDueDate: string, visibilityScope: string): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, title: string, categoryId: string, description: string, ownerUserId: string, issueDate: string, expiryDate: string, renewalDueDate: string, visibilityScope: string, status: string): Promise<{
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
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadFile(req: any, id: string): Promise<{
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
    } | {
        success: boolean;
        message: string;
    }>;
    downloadFile(req: any, id: string, res: any): Promise<void>;
    initiateRenewal(req: any, id: string, remarks: string): Promise<{
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
    getHistory(req: any, id: string): Promise<{
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
