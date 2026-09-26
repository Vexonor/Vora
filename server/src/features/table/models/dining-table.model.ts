import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';

@Table({
  ...SOFT_DELETE_TABLE_OPTIONS,
  tableName: 'tables',
  modelName: 'tables',
})
export class DiningTable extends Model {
  @Column(DataType.BIGINT)
  number: number;
}
