import { CategoriesService } from '../application/categories.service';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    create(req: any, name: string, description: string, isActive: boolean): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, name: string, description: string, isActive: boolean): Promise<{
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
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
