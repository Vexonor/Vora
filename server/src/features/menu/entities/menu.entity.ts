import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { getMenuStatusEnumLabel } from '../enums/menu-status.enum';
import { getMenuTypeEnumLabel } from '../enums/menu-type.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'menus',
  modelName: 'menus',
})
export class Menu extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  price: number;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getMenuStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column({ type: DataType.TINYINT, allowNull: false })
  type: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getMenuTypeEnumLabel(+this.getDataValue('type'));
    },
  })
  type_name: string;

  @Column(DataType.STRING)
  description: string;

  @Column(DataType.STRING)
  image_path: string;

  @Column(DataType.STRING)
  image_url: string;
}
