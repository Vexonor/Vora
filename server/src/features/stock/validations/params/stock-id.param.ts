import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Stock } from '../../entities/stock.entity';

export const stockIdExternal = async (value) => {
  const stock = await Stock.findByPk(value);
  if (!stock) {
    throw new Joi.ValidationError(
      'any.invalid-stock-id',
      [
        {
          message: ErrorCodeEnum.STOCK_NOT_FOUND,
          path: ['id'],
          type: 'any.invalid-stock-id',
          context: {
            key: 'id',
            label: 'id',
            value,
          },
        },
      ],
      value,
    );
  }
  return stock;
};

export const stockIdParamSchema = Joi.number()
  .required()
  .external(stockIdExternal);
