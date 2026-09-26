import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { findByPkOrFail } from 'src/core/database/find-or-fail';
import { ListQuery } from 'src/core/database/list-query';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { SaveUnitDto } from './dto/save-unit.dto';
import { Unit } from './models/unit.model';

@Injectable()
export class UnitService {
  constructor(@InjectModel(Unit) private readonly unitModel: typeof Unit) {}

  create(dto: SaveUnitDto) {
    return this.unitModel.create({ ...dto });
  }

  async findAll(query: ListQuery) {
    const { count, rows } = await this.unitModel.findForList(query);
    return { count, units: rows };
  }

  findOne(id: number) {
    return findByPkOrFail(this.unitModel, id, [ErrorCode.UNIT_NOT_FOUND]);
  }

  async update(id: number, dto: SaveUnitDto) {
    const unit = await this.findOne(id);
    return unit.update({ ...dto });
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    await unit.destroy();
  }
}
