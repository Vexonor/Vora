import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';

@Table({
  ...SOFT_DELETE_TABLE_OPTIONS,
  tableName: 'selling_reports',
  modelName: 'selling_reports',
})
export class SellingReport extends Model {
  @Column(DataType.STRING)
  title: string;

  @Column(DataType.DATE)
  date: Date;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  total_transaction: number;

  @Column(DataType.BIGINT)
  total_items_sold: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  unit_cost: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  gross_revenue: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: false,
  })
  net_profit: number;

  @Column({
    type: DataType.DECIMAL(16, 3),
    allowNull: true,
  })
  operational_cost: number | null;
}
