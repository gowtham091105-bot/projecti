import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { RolesGuard } from '../../../core/auth/roles.guard';
import { Roles } from '../../../core/auth/roles.decorator';
import { DocumentsService } from '../application/documents.service';
import * as fs from 'fs';

@Controller('api/docsafe/documents')
@UseGuards(AuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager', 'Uploader')
  async create(
    @Request() req: any,
    @Body('title') title: string,
    @Body('categoryId') categoryId: string,
    @Body('description') description: string,
    @Body('ownerUserId') ownerUserId: string,
    @Body('issueDate') issueDate: string,
    @Body('expiryDate') expiryDate: string,
    @Body('renewalDueDate') renewalDueDate: string,
    @Body('visibilityScope') visibilityScope: string
  ) {
    const user = req.user;
    return this.documentsService.create(
      user.tenantId,
      { title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope },
      user.id,
      user.name
    );
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.documentsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('categoryId') categoryId: string,
    @Body('description') description: string,
    @Body('ownerUserId') ownerUserId: string,
    @Body('issueDate') issueDate: string,
    @Body('expiryDate') expiryDate: string,
    @Body('renewalDueDate') renewalDueDate: string,
    @Body('visibilityScope') visibilityScope: string,
    @Body('status') status: string
  ) {
    const user = req.user;
    return this.documentsService.update(
      user.tenantId,
      id,
      { title, categoryId, description, ownerUserId, issueDate, expiryDate, renewalDueDate, visibilityScope, status },
      user.name
    );
  }

  @Delete(':id')
  @Roles('Super Admin', 'Org Admin')
  async remove(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    return this.documentsService.remove(user.tenantId, id, user.name);
  }

  @Post(':id/upload')
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager', 'Uploader')
  async uploadFile(
    @Request() req: any,
    @Param('id') id: string
  ) {
    const user = req.user;
    // Fastify-multipart helper to get file stream
    const fileData = await req.file();
    if (!fileData) {
      return { success: false, message: 'No file part found in request.' };
    }
    const buffer = await fileData.toBuffer();
    return this.documentsService.uploadFile(
      user.tenantId,
      id,
      fileData.filename,
      buffer,
      user.name
    );
  }

  @Get(':id/download')
  async downloadFile(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: any
  ) {
    const file = await this.documentsService.downloadFile(req.user.tenantId, id);
    res.header('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(fs.createReadStream(file.filePath));
  }

  @Post(':id/renewal')
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async initiateRenewal(
    @Request() req: any,
    @Param('id') id: string,
    @Body('remarks') remarks: string
  ) {
    const user = req.user;
    return this.documentsService.initiateRenewal(user.tenantId, id, remarks, user.id, user.name);
  }

  @Get(':id/history')
  async getHistory(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.getHistory(req.user.tenantId, id);
  }
}
