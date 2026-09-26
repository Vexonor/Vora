import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellingReportService } from './selling-report.service';
import { SellingReportController } from './selling-report.controller';
import { SellingReport } from './models/selling-report.model';
import { Order } from '../order/models/order.model';
import { Payment } from '../payment/models/payment.model';

@Module({
  imports: [SequelizeModule.forFeature([SellingReport, Order, Payment])],
  controllers: [SellingReportController],
  providers: [SellingReportService],
})
export class SellingReportModule {}
