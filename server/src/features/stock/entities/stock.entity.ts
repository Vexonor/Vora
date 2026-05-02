import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Material } from 'src/features/material/entities/material.entity';
import { getStockStatusEnumLabel } from '../enums/stock-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'stocks',
  modelName: 'stocks',
})
export class Stock extends Model {
  @ForeignKey(() => Material)
  @Column(DataType.BIGINT)
  material_id: number;

  @Column({ type: DataType.TINYINT, allowNull: true, defaultValue: 1 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getStockStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column(DataType.BIGINT)
  quantity: number;

  @Column(DataType.BIGINT)
  minimum: number;

  @Column(DataType.BIGINT)
  maximum: number;
}
