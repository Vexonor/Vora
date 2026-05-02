import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Menu } from 'src/features/menu/entities/menu.entity';
import { Order } from 'src/features/order/entities/order.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
  paranoid: false,
  tableName: 'order_items',
  modelName: 'order_items',
})
export class OrderItem extends Model {
  @ForeignKey(() => Menu)
  @Column(DataType.BIGINT)
  menu_id: number;

  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  order_id: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total_price: number;
}
