import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  ListQuery,
  toPagination,
  toSearchCondition,
  toSortOrder,
} from 'src/core/database/list-query';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';

const SEARCHABLE_FIELDS = ['number'];
const SORTABLE_FIELDS = ['id', 'number', 'created_at'];

@Table({
  ...SOFT_DELETE_TABLE_OPTIONS,
  tableName: 'tables',
  modelName: 'tables',
})
export class DiningTable extends Model {
  @Column(DataType.BIGINT)
  number: number;

  static findForList(query: ListQuery) {
    return DiningTable.findAndCountAll({
      where: toSearchCondition(query.q, SEARCHABLE_FIELDS),
      order: toSortOrder(query, SORTABLE_FIELDS),
      ...toPagination(query),
    });
  }
}
