import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { Tables } from 'src/features/table/entities/table.entity';
import { OrderItem } from 'src/features/order-item/entities/order-item.entity';
import { Payment } from 'src/features/payment/entities/payment.entity';
import { getOrderStatusEnumLabel } from '../enums/order-status.enum';
import OrderTypeEnum, { getOrderTypeEnumLabel } from '../enums/order-type.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
  paranoid: false,
  tableName: 'orders',
  modelName: 'orders',
})
export class Order extends Model {
  @ForeignKey(() => Tables)
  @Column({ type: DataType.BIGINT, allowNull: true })
  table_id: number | null;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: OrderTypeEnum.DINE_IN,
  })
  order_type: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getOrderTypeEnumLabel(+this.getDataValue('order_type'));
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
    get() {
      return getOrderStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cancel_reason: string | null;

  @HasMany(() => OrderItem)
  items: OrderItem[];

  @HasOne(() => Payment)
  payment: Payment;
}
