import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { SearchService } from '../application/search.service';

@Controller('api/docsafe/search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('documents')
  async searchDocuments(
    @Request() req: any,
    @Query('q') q: string,
    @Query('categoryId') categoryId: string,
    @Query('status') status: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.searchService.searchDocuments(req.user.tenantId, {
      q,
      categoryId,
      status,
      startDate,
      endDate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('compliance-items')
  async searchCompliance(
    @Request() req: any,
    @Query('q') q: string,
    @Query('status') status: string,
    @Query('severity') severity: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.searchService.searchCompliance(req.user.tenantId, {
      q,
      status,
      severity,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
