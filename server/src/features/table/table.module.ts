import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiningTable } from './models/dining-table.model';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
  imports: [SequelizeModule.forFeature([DiningTable])],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
