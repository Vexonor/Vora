import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('manager')
  getManagerStats() {
    return this.dashboardService.getManagerStats();
  }

  @Get('manager/chart')
  getManagerChartData(@Query('period') period: string) {
    return this.dashboardService.getManagerChartData(period || '7d');
  }

  @Get('cashier')
  getCashierStats() {
    return this.dashboardService.getCashierStats();
  }

  @Get('cashier/active-orders')
  getActiveOrders() {
    return this.dashboardService.getActiveOrders();
  }

  @Get('cashier/pending-payments')
  getPendingPayments() {
    return this.dashboardService.getPendingPayments();
  }
}
