import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { Menu } from '../menu/models/menu.model';
import { DiningTable } from 'src/features/table/models/dining-table.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Menu, DiningTable])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
