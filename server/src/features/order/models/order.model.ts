import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import { CREATED_AT_ONLY_TABLE_OPTIONS } from 'src/core/database/table-options';
import { Payment } from 'src/features/payment/models/payment.model';
import { DiningTable } from 'src/features/table/models/dining-table.model';
import { getOrderStatusLabel } from '../enums/order-status.enum';
import { getOrderTypeLabel, OrderType } from '../enums/order-type.enum';
import { OrderItem } from './order-item.model';

@Table({
  ...CREATED_AT_ONLY_TABLE_OPTIONS,
  tableName: 'orders',
  modelName: 'orders',
})
export class Order extends Model {
  @ForeignKey(() => DiningTable)
  @Column({ type: DataType.BIGINT, allowNull: true })
  table_id: number | null;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: OrderType.DINE_IN,
  })
  order_type: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Order) {
      return getOrderTypeLabel(Number(this.getDataValue('order_type')));
    },
  })
  order_type_name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  customer_name: string | null;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total_price: number;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Order) {
      return getOrderStatusLabel(Number(this.getDataValue('status')));
    },
  })
  status_name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cancel_reason: string | null;

  @HasMany(() => OrderItem)
  items: OrderItem[];

  @HasOne(() => Payment)
  payment: NonAttribute<Payment>;
}
