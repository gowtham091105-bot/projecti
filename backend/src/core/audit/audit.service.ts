import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logEvent(
    tenantId: string,
    documentId: string | null,
    eventType: string,
    payload: any,
    triggeredBy: string
  ) {
    return this.prisma.documentEvent.create({
      data: {
        tenantId,
        documentId,
        eventType,
        payloadJson: payload ? JSON.stringify(payload) : null,
        triggeredBy,
      },
    });
  }
}
