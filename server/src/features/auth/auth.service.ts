import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { Op } from 'sequelize';
import { User } from '../user/entities/user.entity';
import UserRoleEnum from '../user/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from 'src/core/modules/s3/s3.service';

const S3_AVATAR_FOLDER = 'avatars';

@Injectable()
export class AuthService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
    private readonly s3Service: S3Service,
  ) {}

  login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const result = {
      user,
      access_token: this.jwtService.sign(payload),
    };
    return this.response.success(result, 200);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({
        where: { email },
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
    return this.userModel.findByPk(id);
  }

  getMe(currentUser: User) {
    return this.response.success(currentUser, 200, 'Successfully retrieved profile');
  }

  async updateProfile(
    dto: UpdateProfileDto,
    currentUser: User,
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findByPk(currentUser.id);
    if (!user) {
      return this.response.fail('User not found', 404);
    }

    const updates: Partial<{
      username: string;
      email: string;
      avatar_path: string | null;
      avatar_url: string | null;
    }> = {};

    if (dto.username !== undefined) {
      const username = dto.username.trim();
      if (username.length > 0) updates.username = username;
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return this.response.fail('Format email tidak valid', 422);
      }
      if (email !== user.email) {
        const existing = await this.userModel.findOne({
          where: { email, id: { [Op.ne]: user.id } },
        });
        if (existing) {
          return this.response.fail('Email sudah digunakan', 409);
        }
        updates.email = email;
      }
    }

    let oldAvatarToDelete: string | null = null;
    if (file) {
      const uploadResult = await this.s3Service.uploadFile(
        file,
        S3_AVATAR_FOLDER,
      );
      oldAvatarToDelete = user.avatar_path;
      updates.avatar_path = uploadResult.key;
      updates.avatar_url = uploadResult.url;
    }

    try {
      await user.update(updates);
    } catch (error: any) {
      // Roll back freshly-uploaded avatar if the DB write fails
      if (updates.avatar_path) {
        await this.s3Service.deleteFile(updates.avatar_path);
      }
      return this.response.fail(error.message, 400);
    }

    if (oldAvatarToDelete) {
      await this.s3Service.deleteFile(oldAvatarToDelete);
    }

    return this.response.success(user, 200, 'Successfully updated profile');
  }

  async changePassword(dto: ChangePasswordDto, currentUser: User) {
    try {
      const user = await this.userModel.findByPk(currentUser.id, {
        attributes: { include: ['password'] },
      });

      if (!user) {
        return this.response.fail('User not found', 404);
      }

      const isValid = await Bun.password.verify(
        dto.current_password,
        user.password.replace(/\$2y\$|\$2a\$/, '$2b$'),
        'bcrypt',
      );

      if (!isValid) {
        return this.response.fail(ErrorCodeEnum.INVALID_CURRENT_PASSWORD, 400);
      }

      const hashed = await Bun.password.hash(dto.new_password, {
        algorithm: 'bcrypt',
        cost: 10,
      });

      await user.update({ password: hashed });
      return this.response.success(null, 200, 'Password changed successfully');
    } catch (error: any) {
      return this.response.fail(error.message, 500);
    }
  }

  async register(createUserDto: CreateUserDto, currentUser: User) {
    if (currentUser.role !== UserRoleEnum.MANAGER) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, 403);
    }
    const transaction = await this.sequelize.transaction();
    try {
      const digits = Math.floor(1000 + Math.random() * 9000);
      const defaultPassword = `Vora@${digits}`;
      const hashedPassword = await Bun.password.hash(defaultPassword, {
        algorithm: 'bcrypt',
        cost: 10,
      });

      const user = await this.userModel
        .create({ ...createUserDto, password: hashedPassword }, { transaction })
        .then((value) => value.toJSON());

      delete user.password;
      await transaction.commit();
      return this.response.success(
        { ...user, default_password: defaultPassword },
        201,
        'Successfully register user',
      );
    } catch (error: any) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
