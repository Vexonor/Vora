import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellingReport } from '../selling-report/entities/selling-report.entity';
import { AiPredictionController } from './ai-prediction.controller';
import { AiPredictionService } from './ai-prediction.service';

@Module({
  imports: [SequelizeModule.forFeature([SellingReport])],
  controllers: [AiPredictionController],
  providers: [AiPredictionService],
  exports: [AiPredictionService],
})
export class AiPredictionModule {}
