import {
  Column,
  DataType,
  DefaultScope,
  Model,
  Table,
} from 'sequelize-typescript';
import { SOFT_DELETE_TABLE_OPTIONS } from 'src/core/database/table-options';
import { getUserRoleLabel } from '../enums/user-role.enum';

@Table({ ...SOFT_DELETE_TABLE_OPTIONS, tableName: 'users', modelName: 'users' })
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
    get(this: User) {
      return getUserRoleLabel(Number(this.getDataValue('role')));
    },
  })
  role_name: string;
}
