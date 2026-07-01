import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
export declare class ComplianceService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(tenantId: string, data: {
        name: string;
        categoryId: string | null;
        linkedDocumentId: string | null;
        dueDate: string | null;
        severity: string;
        status: string;
        notes?: string;
    }, userName: string): Promise<{
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
    findAll(tenantId: string): Promise<{
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
    findOne(tenantId: string, id: string): Promise<{
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
    update(tenantId: string, id: string, data: {
        name: string;
        categoryId: string | null;
        linkedDocumentId: string | null;
        dueDate: string | null;
        severity: string;
        status: string;
        notes?: string;
    }, userName: string): Promise<{
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
    remove(tenantId: string, id: string, userName: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
