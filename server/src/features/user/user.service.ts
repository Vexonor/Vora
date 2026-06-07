import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import UserRoleEnum from './enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly response: ResponseHelper,
  ) {}

  async findAll(query: { q?: string; role?: string } = {}) {
    let allowedRoles = [UserRoleEnum.CASHIER, UserRoleEnum.KITCHEN];

    if (query.role !== undefined && query.role !== '') {
      try {
        const parsed = JSON.parse(query.role);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .map(Number)
            .filter((r) => [UserRoleEnum.CASHIER, UserRoleEnum.KITCHEN].includes(r));
          if (filtered.length > 0) allowedRoles = filtered;
        }
      } catch {
        // ignore invalid JSON
      }
    }

    const where: any = { role: { [Op.in]: allowedRoles } };

    if (query.q) {
      where[Op.or] = [
        { username: { [Op.like]: `%${query.q}%` } },
        { email: { [Op.like]: `%${query.q}%` } },
      ];
    }

    const users = await this.userModel.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
    return this.response.success(users, 200, 'Successfully retrieved all staff');
  }

  async findOne(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      return this.response.fail(`User with ID ${id} not found`, 404);
    }
    return this.response.success(user, 200, 'Successfully retrieved user');
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      return this.response.fail(`User with ID ${id} not found`, 404);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({
        where: { email: dto.email, id: { [Op.ne]: id } },
      });
      if (existing) {
        return this.response.fail('Email sudah digunakan', 409);
      }
    }

    await user.update({
      ...(dto.username !== undefined ? { username: dto.username } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
    });

    return this.response.success(user, 200, 'Successfully updated user');
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      return this.response.fail(`User with ID ${id} not found`, 404);
    }
    await user.destroy();
    return this.response.success({}, 200, `User with ID ${id} has been deleted`);
  }
}
