import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { getMenuStatusOptions } from '../menu/enums/menu-status.enum';
import { getMenuTypeOptions } from '../menu/enums/menu-type.enum';
import { getOrderStatusOptions } from '../order/enums/order-status.enum';
import { getOrderTypeOptions } from '../order/enums/order-type.enum';
import { getPaymentTypeOptions } from '../payment/enums/payment-type.enum';
import { getStockStatusOptions } from '../stock/enums/stock-status.enum';
import { getUserRoleOptions } from '../user/enums/user-role.enum';

@Controller()
export class EnumController {
  @Get('user-roles')
  @ResponseMessage('Successfully retrieve user role enums')
  getUserRoles() {
    return getUserRoleOptions();
  }

  @Get('stock-statuses')
  @ResponseMessage('Successfully retrieve stock status enums')
  getStockStatuses() {
    return getStockStatusOptions();
  }

  @Get('menu-types')
  @ResponseMessage('Successfully retrieve menu type enums')
  getMenuTypes() {
    return getMenuTypeOptions();
  }

  @Get('menu-statuses')
  @ResponseMessage('Successfully retrieve menu status enums')
  getMenuStatuses() {
    return getMenuStatusOptions();
  }

  @Get('order-statuses')
  @ResponseMessage('Successfully retrieve order status enums')
  getOrderStatuses() {
    return getOrderStatusOptions();
  }

  @Get('order-types')
  @ResponseMessage('Successfully retrieve order type enums')
  getOrderTypes() {
    return getOrderTypeOptions();
  }

  @Get('payment-types')
  @ResponseMessage('Successfully retrieve payment type enums')
  getPaymentTypes() {
    return getPaymentTypeOptions();
  }
}
