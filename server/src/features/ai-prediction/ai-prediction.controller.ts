import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { AiPredictionService } from './ai-prediction.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class AiPredictionController {
  constructor(private readonly aiPredictionService: AiPredictionService) {}

  @Get('prediction')
  predict(@Query('days') days?: string) {
    return this.aiPredictionService.predict(days ? Number(days) : 30);
  }
}
