import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tables } from './entities/table.entity';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
  imports: [SequelizeModule.forFeature([Tables])],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
