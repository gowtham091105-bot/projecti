import { Module } from '@nestjs/common';
import { CategoriesService } from './application/categories.service';
import { CategoriesController } from './api/categories.controller';
import { DocumentsService } from './application/documents.service';
import { DocumentsController } from './api/documents.controller';
import { ComplianceService } from './application/compliance.service';
import { ComplianceController } from './api/compliance.controller';
import { DashboardService } from './application/dashboard.service';
import { DashboardController } from './api/dashboard.controller';
import { SearchService } from './application/search.service';
import { SearchController } from './api/search.controller';

import { PrismaService } from '../../core/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import { StorageService } from '../../core/storage/storage.service';

@Module({
  providers: [
    PrismaService,
    AuditService,
    StorageService,
    CategoriesService,
    DocumentsService,
    ComplianceService,
    DashboardService,
    SearchService,
  ],
  controllers: [
    CategoriesController,
    DocumentsController,
    ComplianceController,
    DashboardController,
    SearchController,
  ],
})
export class DocsafeModule {}
