import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  ListQuery,
  toPagination,
  toSearchCondition,
  toSortOrder,
} from 'src/core/database/list-query';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';

const SEARCHABLE_FIELDS = ['name', 'abbreviation'];
const SORTABLE_FIELDS = ['id', 'name', 'abbreviation', 'created_at'];

@Table({ ...SOFT_DELETE_TABLE_OPTIONS, tableName: 'units', modelName: 'units' })
export class Unit extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  abbreviation: string;

  static findForList(query: ListQuery) {
    return Unit.findAndCountAll({
      where: toSearchCondition(query.q, SEARCHABLE_FIELDS),
      order: toSortOrder(query, SORTABLE_FIELDS),
      ...toPagination(query),
    });
  }
}
