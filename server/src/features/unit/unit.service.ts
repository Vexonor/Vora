import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { QueryBuilderHelper } from 'src/core/helpers/query-builder.helper';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from '../user/entities/user.entity';
import UserRoleEnum from '../user/enums/user-role.enum';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitService {
  constructor(
    @InjectModel(Unit)
    private unitModel: typeof Unit,
    private response: ResponseHelper,
    private sequelize: Sequelize,
  ) {}

  async create(createUnitDto: CreateUnitDto, currentUser: User) {
    if (
      currentUser.role !== UserRoleEnum.MANAGER &&
      currentUser.role !== UserRoleEnum.KITCHEN
    ) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    const transaction = await this.sequelize.transaction();
    try {
      const unit = await this.unitModel.create(
        {
          ...createUnitDto,
        },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        unit,
        HttpStatus.CREATED,
        'Successfully created unit',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.UNIT_CREATE_FAILED,
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
        this.unitModel,
        query,
      ).getResult();

      const result = {
        count: count,
        units: data,
      };

      return this.response.success(
        result,
        HttpStatus.OK,
        'Successfully get all units',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.FAILED_GET_ALL_UNITS,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(unit: Unit) {
    try {
      return this.response.success(
        unit,
        HttpStatus.OK,
        'Successfully get unit',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.UNIT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async update(unit: Unit, updateUnitDto: UpdateUnitDto) {
    const transaction = await this.sequelize.transaction();
    try {
      await unit.update({ ...updateUnitDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        unit,
        HttpStatus.OK,
        'Successfully update unit',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.UNIT_UPDATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(unit: Unit) {
    const transaction = await this.sequelize.transaction();
    try {
      await unit.destroy({ transaction });
      await transaction.commit();
      return this.response.success(
        {},
        HttpStatus.OK,
        'Successfully delete unit',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.UNIT_DELETE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
