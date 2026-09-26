import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Stock } from './models/stock.model';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [SequelizeModule.forFeature([Stock])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
