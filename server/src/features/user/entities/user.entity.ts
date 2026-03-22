import { Column, DataType, DefaultScope, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'users',
  modelName: 'users',
})
@DefaultScope(() => ({
  attributes: {
    exclude: ['password'],
  },
}))
export class User extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TINYINT)
  roles: number;

  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Column(DataType.STRING)
  password: string;
}
