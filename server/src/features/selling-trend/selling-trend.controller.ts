import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { SellingTrendService } from './selling-trend.service';
import type { MetricKey } from './accuracy.util';

@UseGuards(JwtAuthGuard)
@Controller()
export class SellingTrendController {
  constructor(private readonly sellingTrendService: SellingTrendService) {}

  @Get('accuracy')
  getAccuracy(
    @Query('metric') metric?: MetricKey,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sellingTrendService.getAccuracy(metric ?? 'gross_revenue', from, to);
  }
}
