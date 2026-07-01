import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { DashboardService } from '../application/dashboard.service';

@Controller('api/docsafe/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Request() req: any) {
    return this.dashboardService.getSummary(req.user.tenantId);
  }

  @Get('expiring-soon')
  async getExpiringSoon(@Request() req: any) {
    return this.dashboardService.getExpiringSoon(req.user.tenantId);
  }

  @Get('expired')
  async getExpired(@Request() req: any) {
    return this.dashboardService.getExpired(req.user.tenantId);
  }

  @Get('missing')
  async getMissing(@Request() req: any) {
    return this.dashboardService.getMissing(req.user.tenantId);
  }
}
