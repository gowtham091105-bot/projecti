"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../../core/auth/auth.guard");
const roles_guard_1 = require("../../../core/auth/roles.guard");
const roles_decorator_1 = require("../../../core/auth/roles.decorator");
const compliance_service_1 = require("../application/compliance.service");
let ComplianceController = class ComplianceController {
    complianceService;
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    async create(req, name, categoryId, linkedDocumentId, dueDate, severity, status, notes) {
        const user = req.user;
        return this.complianceService.create(user.tenantId, { name, categoryId, linkedDocumentId, dueDate, severity, status, notes }, user.name);
    }
    async findAll(req) {
        return this.complianceService.findAll(req.user.tenantId);
    }
    async findOne(req, id) {
        return this.complianceService.findOne(req.user.tenantId, id);
    }
    async update(req, id, name, categoryId, linkedDocumentId, dueDate, severity, status, notes) {
        const user = req.user;
        return this.complianceService.update(user.tenantId, id, { name, categoryId, linkedDocumentId, dueDate, severity, status, notes }, user.name);
    }
    async remove(req, id) {
        const user = req.user;
        return this.complianceService.remove(user.tenantId, id, user.name);
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('categoryId')),
    __param(3, (0, common_1.Body)('linkedDocumentId')),
    __param(4, (0, common_1.Body)('dueDate')),
    __param(5, (0, common_1.Body)('severity')),
    __param(6, (0, common_1.Body)('status')),
    __param(7, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('categoryId')),
    __param(4, (0, common_1.Body)('linkedDocumentId')),
    __param(5, (0, common_1.Body)('dueDate')),
    __param(6, (0, common_1.Body)('severity')),
    __param(7, (0, common_1.Body)('status')),
    __param(8, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "remove", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('api/docsafe/compliance-items'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map