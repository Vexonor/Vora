import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'tables',
  modelName: 'tables',
})
export class Tables extends Model {
  @Column(DataType.BIGINT)
  quantity: number;
}
