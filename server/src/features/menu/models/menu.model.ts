import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';
import { OrderItem } from 'src/features/order/models/order-item.model';
import { getMenuStatusLabel } from '../enums/menu-status.enum';
import { getMenuTypeLabel } from '../enums/menu-type.enum';

@Table({ ...SOFT_DELETE_TABLE_OPTIONS, tableName: 'menus', modelName: 'menus' })
export class Menu extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
    defaultValue: 0,
  })
  cost: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  price: number;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Menu) {
      return getMenuStatusLabel(Number(this.getDataValue('status')));
    },
  })
  status_name: string;

  @Column({ type: DataType.TINYINT, allowNull: false })
  type: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Menu) {
      return getMenuTypeLabel(Number(this.getDataValue('type')));
    },
  })
  type_name: string;

  @Column(DataType.STRING)
  description: string;

  @Column(DataType.STRING)
  image_path: string;

  @Column(DataType.STRING)
  image_url: string;

  @HasMany(() => OrderItem)
  order_items: OrderItem[];
}
