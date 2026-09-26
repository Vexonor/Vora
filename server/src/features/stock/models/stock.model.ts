import {
  BeforeSave,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';
import { Unit } from 'src/features/unit/models/unit.model';
import { getStockStatusLabel, StockStatus } from '../enums/stock-status.enum';

@Table({
  ...SOFT_DELETE_TABLE_OPTIONS,
  tableName: 'stocks',
  modelName: 'stocks',
})
export class Stock extends Model {
  static searchable = ['stocks.name'];

  @ForeignKey(() => Unit)
  @Column(DataType.BIGINT)
  unit_id: number;

  @Column(DataType.STRING)
  name: string;

  @Column({ type: DataType.TINYINT, allowNull: true, defaultValue: 1 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Stock) {
      return getStockStatusLabel(Number(this.getDataValue('status')));
    },
  })
  status_name: string;

  @Column(DataType.BIGINT)
  quantity: number;

  @Column(DataType.BIGINT)
  minimum: number;

  @Column(DataType.BIGINT)
  maximum: number;

  @BeforeSave
  static assignStockStatus(stock: Stock) {
    if (stock.status === StockStatus.DISCONTINUED) {
      return;
    }

    const currentQty = Number(stock.quantity);
    const minQty = Number(stock.minimum);

    if (currentQty <= 0) {
      stock.status = StockStatus.OUT_OF_STOCK;
    } else if (currentQty <= minQty) {
      stock.status = StockStatus.LOW_STOCK;
    } else {
      stock.status = StockStatus.IN_STOCK;
    }
  }
}
