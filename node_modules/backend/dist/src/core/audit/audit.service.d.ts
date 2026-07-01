import { PrismaService } from '../prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logEvent(tenantId: string, documentId: string | null, eventType: string, payload: any, triggeredBy: string): Promise<{
        id: string;
        tenantId: string;
        documentId: string | null;
        eventType: string;
        payloadJson: string | null;
        triggeredBy: string;
        triggeredAt: Date;
    }>;
}
