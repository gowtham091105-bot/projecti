import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { RolesGuard } from '../../../core/auth/roles.guard';
import { Roles } from '../../../core/auth/roles.decorator';
import { CategoriesService } from '../application/categories.service';

@Controller('api/docsafe/categories')
@UseGuards(AuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async create(
    @Request() req: any,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('isActive') isActive: boolean
  ) {
    const user = req.user;
    return this.categoriesService.create(user.tenantId, name, description, isActive ?? true, user.id, user.name);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.categoriesService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('Super Admin', 'Org Admin', 'Compliance Manager')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('isActive') isActive: boolean
  ) {
    const user = req.user;
    return this.categoriesService.update(user.tenantId, id, name, description, isActive ?? true, user.name);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Org Admin')
  async remove(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    return this.categoriesService.remove(user.tenantId, id, user.name);
  }
}
