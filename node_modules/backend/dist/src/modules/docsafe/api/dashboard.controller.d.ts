import { DashboardService } from '../application/dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            expiring: number;
            expired: number;
            missing: number;
            renewal: number;
            recentEvents: {
                id: string;
                tenantId: string;
                documentId: string | null;
                eventType: string;
                payloadJson: string | null;
                triggeredBy: string;
                triggeredAt: Date;
            }[];
        };
    }>;
    getExpiringSoon(req: any): Promise<{
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
    getExpired(req: any): Promise<{
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
    getMissing(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: string;
            categoryId: string | null;
            linkedDocumentId: string | null;
            dueDate: Date | null;
            severity: string;
            notes: string | null;
        }[];
    }>;
}
