import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from '../user/entities/user.entity';
import UserRoleEnum from '../user/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const result = {
      user,
      accsess_token: this.jwtService.sign(payload),
    };
    return this.response.success(result, 200);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({
        where: { email: email },
        attributes: { include: ['password'] },
      });

      if (user) {
        const isValid = await Bun.password.verify(
          password,
          user.password.replace(/\$2y\$|\$2a\$/, '$2b$'),
          'bcrypt',
        );
        if (isValid) {
          const result = user.toJSON();
          delete result.password;
          return result;
        }
      }

      return false;
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async validateJwt(id: number) {
    const user = await this.userModel.findByPk(id);
    return user;
  }

  async register(createUserDto: CreateUserDto, currentUser: User) {
    if (currentUser.role !== UserRoleEnum.MANAGER) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, 403);
    }
    const transaction = await this.sequelize.transaction();
    try {
      createUserDto.password = await Bun.password.hash(createUserDto.password, {
        algorithm: 'bcrypt',
        cost: 10,
      });
      const user = await this.userModel
        .create({ ...createUserDto })
        .then((value) => value.toJSON());

      delete user.password;
      await transaction.commit();
      return this.response.success(user, 201, 'Successfully register user');
    } catch (error: any) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
