import { RouterModule } from '@nestjs/core';
import { AuthModule } from 'src/features/auth/auth.module';
import { DashboardModule } from 'src/features/dashboard/dashboard.module';
import { MenuModule } from 'src/features/menu/menu.module';
import { OrderItemModule } from 'src/features/order-item/order-item.module';
import { OrderModule } from 'src/features/order/order.module';
import { PaymentModule } from 'src/features/payment/payment.module';
import { SellingReportModule } from 'src/features/selling-report/selling-report.module';
import { StockModule } from 'src/features/stock/stock.module';
import { TableModule } from 'src/features/table/table.module';
import { UnitModule } from 'src/features/unit/unit.module';
import { UserModule } from 'src/features/user/user.module';

export default RouterModule.register([
  {
    path: '/api/v1',
    children: [
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'manager',
        children: [
          {
            path: 'users',
            module: UserModule,
          },
          {
            path: 'selling-reports',
            module: SellingReportModule,
          },
        ],
      },
      {
        path: 'tables',
        module: TableModule,
      },
      {
        path: 'menus',
        module: MenuModule,
      },
      {
        path: 'units',
        module: UnitModule,
      },
      {
        path: 'stocks',
        module: StockModule,
      },
      {
        path: 'orders',
        module: OrderModule,
        children: [
          {
            path: ':orderId/items',
            module: OrderItemModule,
          },
        ],
      },
      {
        path: 'payments',
        module: PaymentModule,
      },
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ],
  },
]);
