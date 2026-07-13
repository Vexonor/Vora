import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiPredictionModule } from '../ai-prediction/ai-prediction.module';
import { SellingReport } from '../selling-report/entities/selling-report.entity';
import { SellingTrend } from './entities/selling-trend.entity';
import { SellingTrendController } from './selling-trend.controller';
import { SellingTrendService } from './selling-trend.service';

@Module({
  imports: [
    SequelizeModule.forFeature([SellingTrend, SellingReport]),
    AiPredictionModule,
  ],
  controllers: [SellingTrendController],
  providers: [SellingTrendService],
})
export class SellingTrendModule {}
