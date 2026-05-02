import { Module } from '@nestjs/common';
import { SellingReportService } from './selling-report.service';
import { SellingReportController } from './selling-report.controller';

@Module({
  controllers: [SellingReportController],
  providers: [SellingReportService],
})
export class SellingReportModule {}
