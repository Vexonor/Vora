import { Controller, Get } from '@nestjs/common';
import { EnumService } from './enum.service';

@Controller()
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Get('user-roles')
  userRoles() {
    return this.enumService.UserRole();
  }

  @Get('stock-statuses')
  stockStatuses() {
    return this.enumService.StockStatus();
  }

  @Get('menu-types')
  menuTypes() {
    return this.enumService.MenuType();
  }

  @Get('menu-statuses')
  menuStatuses() {
    return this.enumService.MenuStatus();
  }

  @Get('order-statuses')
  orderStatuses() {
    return this.enumService.OrderStatus();
  }

  @Get('payment-types')
  paymentTypes() {
    return this.enumService.PaymentType();
  }
}
