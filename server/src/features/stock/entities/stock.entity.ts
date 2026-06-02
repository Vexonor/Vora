import {
  BeforeSave,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Unit } from 'src/features/unit/entities/unit.entity';
import StockStatusEnum, {
  getStockStatusEnumLabel,
} from '../enums/stock-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
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
    get() {
      return getStockStatusEnumLabel(+this.getDataValue('status'));
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
    if (stock.status === StockStatusEnum.DISCONTINUED) {
      return;
    }

    const currentQty = Number(stock.quantity);
    const minQty = Number(stock.minimum);

    if (currentQty <= 0) {
      stock.status = StockStatusEnum.OUT_OF_STOCK;
    } else if (currentQty <= minQty) {
      stock.status = StockStatusEnum.LOW_STOCK;
    } else {
      stock.status = StockStatusEnum.IN_STOCK;
    }
  }
}
