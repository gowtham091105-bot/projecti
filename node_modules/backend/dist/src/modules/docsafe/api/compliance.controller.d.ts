import { ComplianceService } from '../application/compliance.service';
export declare class ComplianceController {
    private complianceService;
    constructor(complianceService: ComplianceService);
    create(req: any, name: string, categoryId: string, linkedDocumentId: string, dueDate: string, severity: string, status: string, notes: string): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
        };
    }>;
    update(req: any, id: string, name: string, categoryId: string, linkedDocumentId: string, dueDate: string, severity: string, status: string, notes: string): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
