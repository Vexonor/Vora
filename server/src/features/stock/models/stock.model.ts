import {
  BeforeSave,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Op, WhereOptions } from 'sequelize';
import {
  ListQuery,
  toNumberList,
  toPagination,
  toSearchCondition,
  toSortOrder,
} from 'src/core/database/list-query';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';
import { Unit } from 'src/features/unit/models/unit.model';
import { getStockStatusLabel, StockStatus } from '../enums/stock-status.enum';

export interface StockListQuery extends ListQuery {
  status?: unknown;
}

const SEARCHABLE_FIELDS = ['name'];
const SORTABLE_FIELDS = [
  'id',
  'name',
  'status',
  'quantity',
  'minimum',
  'maximum',
  'created_at',
  'updated_at',
];

@Table({
  ...SOFT_DELETE_TABLE_OPTIONS,
  tableName: 'stocks',
  modelName: 'stocks',
})
export class Stock extends Model {
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

  static resolveStatus(
    currentStatus: number,
    quantity: number,
    minimum: number,
  ): StockStatus {
    if (Number(currentStatus) === StockStatus.DISCONTINUED) {
      return StockStatus.DISCONTINUED;
    }
    if (Number(quantity) <= 0) return StockStatus.OUT_OF_STOCK;
    if (Number(quantity) <= Number(minimum)) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  @BeforeSave
  static syncStatusWithQuantity(stock: Stock) {
    stock.status = Stock.resolveStatus(
      stock.status,
      stock.quantity,
      stock.minimum,
    );
  }

  static findForList(query: StockListQuery) {
    const statuses = toNumberList(query.status);
    const where: WhereOptions = {
      ...toSearchCondition(query.q, SEARCHABLE_FIELDS),
      ...(statuses && { status: { [Op.in]: statuses } }),
    };

    return Stock.findAndCountAll({
      where,
      order: toSortOrder(query, SORTABLE_FIELDS),
      ...toPagination(query),
    });
  }
}
