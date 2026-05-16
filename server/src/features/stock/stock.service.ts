import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { QueryBuilderHelper } from 'src/core/helpers/query-builder.helper';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { User } from '../user/entities/user.entity';
import UserRoleEnum from '../user/enums/user-role.enum';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock)
    private stockModel: typeof Stock,
    private response: ResponseHelper,
    private sequelize: Sequelize,
  ) {}

  async create(createStockDto: CreateStockDto, currentUser: User) {
    if (
      currentUser.role !== UserRoleEnum.MANAGER &&
      currentUser.role !== UserRoleEnum.KITCHEN
    ) {
      return this.response.fail(ErrorCodeEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    const transaction = await this.sequelize.transaction();
    try {
      const stock = await this.stockModel.create(
        {
          ...createStockDto,
        },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        stock,
        HttpStatus.CREATED,
        'Successfully created stock',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.STOCK_CREATE_FAILED,
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
        this.stockModel,
        query,
      ).getResult();

      const result = {
        count: count,
        stocks: data,
      };

      return this.response.success(
        result,
        HttpStatus.OK,
        'Successfully get all stocks',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.FAILED_GET_ALL_STOCKS,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(stock: Stock) {
    try {
      return this.response.success(
        stock,
        HttpStatus.OK,
        'Successfully get stock',
      );
    } catch (error) {
      return this.response.fail(
        ErrorCodeEnum.STOCK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async update(stock: Stock, updateStockDto: UpdateStockDto) {
    const transaction = await this.sequelize.transaction();
    try {
      await stock.update({ ...updateStockDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        stock,
        HttpStatus.OK,
        'Successfully update stock',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.STOCK_UPDATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(stock: Stock) {
    const transaction = await this.sequelize.transaction();
    try {
      await stock.destroy({ transaction });
      await transaction.commit();
      return this.response.success(
        {},
        HttpStatus.OK,
        'Successfully delete stock',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        ErrorCodeEnum.STOCK_DELETE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
