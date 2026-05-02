import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Unit } from 'src/features/unit/entities/unit.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'materials',
  modelName: 'materials',
})
export class Material extends Model {
  @ForeignKey(() => Unit)
  @Column(DataType.BIGINT)
  unit_id: number;

  @Column(DataType.STRING)
  name: string;
}
