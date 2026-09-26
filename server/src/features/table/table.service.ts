import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { QueryBuilderHelper } from 'src/core/helpers/query-builder.helper';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from '../user/models/user.model';
import { UserRole } from '../user/enums/user-role.enum';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { DiningTable } from './models/dining-table.model';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(DiningTable)
    private tableModel: typeof DiningTable,
    private response: ResponseHelper,
    private sequelize: Sequelize,
  ) {}

  async create(createTableDto: CreateTableDto, currentUser: User) {
    if (
      currentUser.role !== UserRole.MANAGER &&
      currentUser.role !== UserRole.KITCHEN
    ) {
      return this.response.fail(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    const transaction = await this.sequelize.transaction();
    try {
      const table = await this.tableModel.create(
        {
          ...createTableDto,
        },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        table,
        HttpStatus.CREATED,
        'Successfully created table',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCode.TABLE_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: any, currentUser: User) {
    if (
      currentUser.role !== UserRole.MANAGER &&
      currentUser.role !== UserRole.KITCHEN &&
      currentUser.role !== UserRole.CASHIER
    ) {
      return this.response.fail(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.tableModel,
        query,
      ).getResult();

      const result = {
        count: count,
        tables: data,
      };

      return this.response.success(
        result,
        HttpStatus.OK,
        'Successfully get all tables',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCode.FAILED_GET_ALL_TABLES,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(table: DiningTable) {
    try {
      return this.response.success(
        table,
        HttpStatus.OK,
        'Successfully get table',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCode.TABLE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async update(table: DiningTable, updateTableDto: UpdateTableDto) {
    const transaction = await this.sequelize.transaction();
    try {
      await table.update({ ...updateTableDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        table,
        HttpStatus.OK,
        'Successfully update table',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCode.TABLE_UPDATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(table: DiningTable) {
    const transaction = await this.sequelize.transaction();
    try {
      await table.destroy({ transaction });
      await transaction.commit();
      return this.response.success(
        {},
        HttpStatus.OK,
        'Successfully delete table',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCode.TABLE_DELETE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
