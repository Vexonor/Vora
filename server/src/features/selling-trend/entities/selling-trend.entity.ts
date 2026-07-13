import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,
  tableName: 'selling_trends',
  modelName: 'selling_trends',
})
export class SellingTrend extends Model {
  @Column({ type: DataType.DATEONLY, allowNull: false })
  generated_date: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  target_date: string;

  @Column({ type: DataType.DECIMAL(16, 3), allowNull: false, defaultValue: 0 })
  gross_revenue: number;

  @Column({ type: DataType.DECIMAL(16, 3), allowNull: false, defaultValue: 0 })
  net_profit: number;

  @Column({ type: DataType.DECIMAL(16, 3), allowNull: false, defaultValue: 0 })
  total_transaction: number;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  total_items_sold: number;
}
