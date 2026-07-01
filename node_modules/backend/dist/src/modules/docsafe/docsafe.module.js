"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsafeModule = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./application/categories.service");
const categories_controller_1 = require("./api/categories.controller");
const documents_service_1 = require("./application/documents.service");
const documents_controller_1 = require("./api/documents.controller");
const compliance_service_1 = require("./application/compliance.service");
const compliance_controller_1 = require("./api/compliance.controller");
const dashboard_service_1 = require("./application/dashboard.service");
const dashboard_controller_1 = require("./api/dashboard.controller");
const search_service_1 = require("./application/search.service");
const search_controller_1 = require("./api/search.controller");
const prisma_service_1 = require("../../core/prisma.service");
const audit_service_1 = require("../../core/audit/audit.service");
const storage_service_1 = require("../../core/storage/storage.service");
let DocsafeModule = class DocsafeModule {
};
exports.DocsafeModule = DocsafeModule;
exports.DocsafeModule = DocsafeModule = __decorate([
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            audit_service_1.AuditService,
            storage_service_1.StorageService,
            categories_service_1.CategoriesService,
            documents_service_1.DocumentsService,
            compliance_service_1.ComplianceService,
            dashboard_service_1.DashboardService,
            search_service_1.SearchService,
        ],
        controllers: [
            categories_controller_1.CategoriesController,
            documents_controller_1.DocumentsController,
            compliance_controller_1.ComplianceController,
            dashboard_controller_1.DashboardController,
            search_controller_1.SearchController,
        ],
    })
], DocsafeModule);
//# sourceMappingURL=docsafe.module.js.map