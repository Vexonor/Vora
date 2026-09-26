import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Unit } from './models/unit.model';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  imports: [SequelizeModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
