import { Column, DataType, DefaultScope, Model, Table } from "sequelize-typescript";
import { getUserRoleEnumLabel } from "../enums/user-role.enum";

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
  username: string;

  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar_path: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar_url: string | null;

  @Column(DataType.STRING)
  password: string;

  @Column({ type: DataType.TINYINT, allowNull: true, defaultValue: 0 })
  role: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getUserRoleEnumLabel(+this.getDataValue("role"));
    },
  })
  role_name: string;
}
