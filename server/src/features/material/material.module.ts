import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Material } from './entities/material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';

@Module({
  imports: [SequelizeModule.forFeature([Material])],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
