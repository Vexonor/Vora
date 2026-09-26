import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CREATED_AT_ONLY_TABLE_OPTIONS } from 'src/core/database/table-options';
import { Order } from 'src/features/order/models/order.model';

@Table({
  ...CREATED_AT_ONLY_TABLE_OPTIONS,
  tableName: 'payments',
  modelName: 'payments',
})
export class Payment extends Model {
  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  order_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  midtrans_transaction_id: string;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: true,
    defaultValue: 0,
  })
  paid: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: true,
    defaultValue: 0,
  })
  change_amount: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: true,
  })
  type: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  qr_image_url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  payment_status: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  snap_token: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  snap_redirect_url: string;
}
