import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Tables } from '../table/entities/table.entity';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Menu, Tables])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
