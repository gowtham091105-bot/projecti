import { SearchService } from '../application/search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchDocuments(req: any, q: string, categoryId: string, status: string, startDate: string, endDate: string, page: string, limit: string): Promise<{
        success: boolean;
        data: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            list: ({
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
        };
    }>;
    searchCompliance(req: any, q: string, status: string, severity: string, page: string, limit: string): Promise<{
        success: boolean;
        data: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            list: {
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
        };
    }>;
}
