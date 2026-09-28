import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentOrders(limit ? parseInt(limit, 10) : 5);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(limit ? parseInt(limit, 10) : 5);
  }

  @Get('monthly-sales')
  getMonthlySales() {
    return this.dashboardService.getMonthlySales();
  }
}
