import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
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

  @BelongsTo(() => Menu)
  menu: Menu | any;

  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  order_id: number;

  @BelongsTo(() => Order)
  order: Order | any;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total_price: number;
}
