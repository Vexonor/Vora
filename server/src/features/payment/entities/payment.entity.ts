import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from 'src/features/order/entities/order.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
  paranoid: false,
  tableName: 'payments',
  modelName: 'payments',
})
export class Payment extends Model {
  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  order_id: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  paid: number;
}
