import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { RolesGuard } from '../../../core/auth/roles.guard';
import { Roles } from '../../../core/auth/roles.decorator';
import { ComplianceService } from '../application/compliance.service';

@Controller('api/docsafe/compliance-items')
@UseGuards(AuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Post()
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async create(
    @Request() req: any,
    @Body('name') name: string,
    @Body('categoryId') categoryId: string,
    @Body('linkedDocumentId') linkedDocumentId: string,
    @Body('dueDate') dueDate: string,
    @Body('severity') severity: string,
    @Body('status') status: string,
    @Body('notes') notes: string
  ) {
    const user = req.user;
    return this.complianceService.create(
      user.tenantId,
      { name, categoryId, linkedDocumentId, dueDate, severity, status, notes },
      user.name
    );
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.complianceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.complianceService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('categoryId') categoryId: string,
    @Body('linkedDocumentId') linkedDocumentId: string,
    @Body('dueDate') dueDate: string,
    @Body('severity') severity: string,
    @Body('status') status: string,
    @Body('notes') notes: string
  ) {
    const user = req.user;
    return this.complianceService.update(
      user.tenantId,
      id,
      { name, categoryId, linkedDocumentId, dueDate, severity, status, notes },
      user.name
    );
  }

  @Delete(':id')
  @Roles('Super Admin', 'Org Admin')
  async remove(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    return this.complianceService.remove(user.tenantId, id, user.name);
  }
}
