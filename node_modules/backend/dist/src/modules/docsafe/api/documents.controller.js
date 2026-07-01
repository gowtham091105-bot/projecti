"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../../core/auth/auth.guard");
const roles_guard_1 = require("../../../core/auth/roles.guard");
const roles_decorator_1 = require("../../../core/auth/roles.decorator");
const documents_service_1 = require("../application/documents.service");
const fs = __importStar(require("fs"));
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async create(req, title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope) {
        const user = req.user;
        return this.documentsService.create(user.tenantId, { title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope }, user.id, user.name);
    }
    async findAll(req) {
        return this.documentsService.findAll(req.user.tenantId);
    }
    async findOne(req, id) {
        return this.documentsService.findOne(req.user.tenantId, id);
    }
    async update(req, id, title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope, status) {
        const user = req.user;
        return this.documentsService.update(user.tenantId, id, { title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope, status }, user.name);
    }
    async remove(req, id) {
        const user = req.user;
        return this.documentsService.remove(user.tenantId, id, user.name);
    }
    async uploadFile(req, id) {
        const user = req.user;
        const fileData = await req.file();
        if (!fileData) {
            return { success: false, message: 'No file part found in request.' };
        }
        const buffer = await fileData.toBuffer();
        return this.documentsService.uploadFile(user.tenantId, id, fileData.filename, buffer, user.name);
    }
    async downloadFile(req, id, res) {
        const file = await this.documentsService.downloadFile(req.user.tenantId, id);
        res.header('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.send(fs.createReadStream(file.filePath));
    }
    async initiateRenewal(req, id, remarks) {
        const user = req.user;
        return this.documentsService.initiateRenewal(user.tenantId, id, remarks, user.id, user.name);
    }
    async getHistory(req, id) {
        return this.documentsService.getHistory(req.user.tenantId, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager', 'Uploader'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('categoryId')),
    __param(3, (0, common_1.Body)('description')),
    __param(4, (0, common_1.Body)('ownerUserId')),
    __param(5, (0, common_1.Body)('issueDate')),
    __param(6, (0, common_1.Body)('expiryDate')),
    __param(7, (0, common_1.Body)('renewalDueDate')),
    __param(8, (0, common_1.Body)('visibilityScope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('title')),
    __param(3, (0, common_1.Body)('categoryId')),
    __param(4, (0, common_1.Body)('description')),
    __param(5, (0, common_1.Body)('ownerUserId')),
    __param(6, (0, common_1.Body)('issueDate')),
    __param(7, (0, common_1.Body)('expiryDate')),
    __param(8, (0, common_1.Body)('renewalDueDate')),
    __param(9, (0, common_1.Body)('visibilityScope')),
    __param(10, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager', 'Uploader'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Post)(':id/renewal'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Org Admin', 'Compliance Manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('remarks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "initiateRenewal", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getHistory", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/docsafe/documents'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map