import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import { CREATED_AT_ONLY_TABLE_OPTIONS } from 'src/core/database/table-options';
import { Menu } from 'src/features/menu/models/menu.model';
import { Order } from './order.model';

@Table({
  ...CREATED_AT_ONLY_TABLE_OPTIONS,
  tableName: 'order_items',
  modelName: 'order_items',
})
export class OrderItem extends Model {
  @ForeignKey(() => Menu)
  @Column(DataType.BIGINT)
  menu_id: number;

  @BelongsTo(() => Menu)
  menu: NonAttribute<Menu>;

  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  order_id: number;

  @BelongsTo(() => Order)
  order: NonAttribute<Order>;

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
