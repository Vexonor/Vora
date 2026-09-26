import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/models/order.model';
import { OrderItem } from '../order/models/order-item.model';
import { Menu } from '../menu/models/menu.model';
import { DiningTable } from '../table/models/dining-table.model';
import { Payment } from '../payment/models/payment.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Menu, DiningTable, Payment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
