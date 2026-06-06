import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellingReportService } from './selling-report.service';
import { SellingReportController } from './selling-report.controller';
import { SellingReport } from './entities/selling-report.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [SequelizeModule.forFeature([SellingReport, Order, Payment])],
  controllers: [SellingReportController],
  providers: [SellingReportService],
})
export class SellingReportModule {}
