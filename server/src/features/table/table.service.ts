import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { findByPkOrFail } from 'src/core/database/find-or-fail';
import { ListQuery } from 'src/core/database/list-query';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { SaveTableDto } from './dto/save-table.dto';
import { DiningTable } from './models/dining-table.model';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(DiningTable) private readonly tableModel: typeof DiningTable,
  ) {}

  create(dto: SaveTableDto) {
    return this.tableModel.create({ ...dto });
  }

  async findAll(query: ListQuery) {
    const { count, rows } = await this.tableModel.findForList(query);
    return { count, tables: rows };
  }

  findOne(id: number) {
    return findByPkOrFail(this.tableModel, id, [ErrorCode.TABLE_NOT_FOUND]);
  }

  async update(id: number, dto: SaveTableDto) {
    const table = await this.findOne(id);
    return table.update({ ...dto });
  }

  async remove(id: number) {
    const table = await this.findOne(id);
    await table.destroy();
  }
}
