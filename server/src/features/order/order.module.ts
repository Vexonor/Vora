import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Tables } from 'src/features/table/entities/table.entity';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Menu, Tables])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
