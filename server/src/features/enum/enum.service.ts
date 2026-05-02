import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { getMenuStatusEnums } from '../menu/enums/menu-status.enum';
import { getMenuTypeEnums } from '../menu/enums/menu-type.enum';
import { getOrderStatusEnums } from '../order/enums/order-status.enum';
import { getPaymentTypeEnums } from '../payment/enums/payment-type.enum';
import { getStockStatusEnums } from '../stock/enums/stock-status.enum';
import { getUserRoleEnums } from '../user/enums/user-role.enum';

@Injectable()
export class EnumService {
  constructor(private response: ResponseHelper) {}
  async UserRole() {
    return this.response.success(
      getUserRoleEnums(),
      HttpStatus.OK,
      'Successfully retrieve user role enums',
    );
  }

  async StockStatus() {
    return this.response.success(
      getStockStatusEnums(),
      HttpStatus.OK,
      'Successfully retrieve stock status enums',
    );
  }

  async MenuType() {
    return this.response.success(
      getMenuTypeEnums(),
      HttpStatus.OK,
      'Successfully retrieve menu type enums',
    );
  }

  async MenuStatus() {
    return this.response.success(
      getMenuStatusEnums(),
      HttpStatus.OK,
      'Successfully retrieve menu status enums',
    );
  }

  async OrderStatus() {
    return this.response.success(
      getOrderStatusEnums(),
      HttpStatus.OK,
      'Successfully retrieve order status enums',
    );
  }

  async PaymentType() {
    return this.response.success(
      getPaymentTypeEnums(),
      HttpStatus.OK,
      'Successfully retrieve payment type enums',
    );
  }
}
