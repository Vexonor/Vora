import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './models/payment.model';
import { Order } from '../order/models/order.model';
import { OrderItem } from '../order/models/order-item.model';
import { Menu } from '../menu/models/menu.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment, Order, OrderItem, Menu]),
    ConfigModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
