import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { findByPkOrFail } from 'src/core/database/find-or-fail';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { SaveStockDto } from './dto/save-stock.dto';
import { Stock, StockListQuery } from './models/stock.model';

@Injectable()
export class StockService {
  constructor(@InjectModel(Stock) private readonly stockModel: typeof Stock) {}

  create(dto: SaveStockDto) {
    return this.stockModel.create({ ...dto });
  }

  async findAll(query: StockListQuery) {
    const { count, rows } = await this.stockModel.findForList(query);
    return { count, stocks: rows };
  }

  findOne(id: number) {
    return findByPkOrFail(this.stockModel, id, [ErrorCode.STOCK_NOT_FOUND]);
  }

  async update(id: number, dto: SaveStockDto) {
    const stock = await this.findOne(id);
    return stock.update({ ...dto });
  }

  async remove(id: number) {
    const stock = await this.findOne(id);
    await stock.destroy();
  }
}
