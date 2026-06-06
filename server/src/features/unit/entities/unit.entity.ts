import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'units',
  modelName: 'units',
})
export class Unit extends Model {
    @Column(DataType.STRING)
    name: string;
    
    @Column(DataType.STRING)
    abbreviation: string;
}
