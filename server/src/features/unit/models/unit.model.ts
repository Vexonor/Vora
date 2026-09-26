import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';

@Table({ ...SOFT_DELETE_TABLE_OPTIONS, tableName: 'units', modelName: 'units' })
export class Unit extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  abbreviation: string;
}
