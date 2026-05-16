import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { QueryBuilderHelper } from 'src/core/helpers/query-builder.helper';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from '../user/entities/user.entity';
import UserRoleEnum from '../user/enums/user-role.enum';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material)
    private materialModel: typeof Material,
    private response: ResponseHelper,
    private sequelize: Sequelize,
  ) {}

  async create(createMaterialDto: CreateMaterialDto, currentUser: User) {
    if (
      currentUser.role !== UserRoleEnum.MANAGER &&
      currentUser.role !== UserRoleEnum.KITCHEN
    ) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    const transaction = await this.sequelize.transaction();
    try {
      const material = await this.materialModel.create(
        {
          ...createMaterialDto,
        },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        material,
        HttpStatus.CREATED,
        'Successfully created material',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.MATERIAL_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: any, currentUser: User) {
    if (
      currentUser.role !== UserRoleEnum.MANAGER &&
      currentUser.role !== UserRoleEnum.KITCHEN
    ) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.materialModel,
        query,
      ).getResult();

      const result = {
        count: count,
        materials: data,
      };

      return this.response.success(
        result,
        HttpStatus.OK,
        'Successfully get all materials',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.FAILED_GET_ALL_MATERIALS,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(material: Material) {
    try {
      return this.response.success(
        material,
        HttpStatus.OK,
        'Successfully get material',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.MATERIAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async update(material: Material, updateMaterialDto: UpdateMaterialDto) {
    const transaction = await this.sequelize.transaction();
    try {
      await material.update({ ...updateMaterialDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        material,
        HttpStatus.OK,
        'Successfully update material',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.MATERIAL_UPDATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(material: Material) {
    const transaction = await this.sequelize.transaction();
    try {
      await material.destroy({ transaction });
      await transaction.commit();
      return this.response.success(
        {},
        HttpStatus.OK,
        'Successfully delete material',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.MATERIAL_DELETE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
