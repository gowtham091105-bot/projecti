import { PrismaService } from '../../../core/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
export declare class CategoriesService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(tenantId: string, name: string, description: string, isActive: boolean, userId: string, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            createdBy: string;
            tenantId: string;
        };
    }>;
    findAll(tenantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            createdBy: string;
            tenantId: string;
        }[];
    }>;
    findOne(tenantId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            createdBy: string;
            tenantId: string;
        };
    }>;
    update(tenantId: string, id: string, name: string, description: string, isActive: boolean, userName: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            createdBy: string;
            tenantId: string;
        };
    }>;
    remove(tenantId: string, id: string, userName: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
