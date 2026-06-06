import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Tables } from '../../entities/table.entity';

export const tableIdExternal = async (value) => {
  const table = await Tables.findByPk(value);
  if (!table) {
    throw new Joi.ValidationError(
      'any.invalid-table-id',
      [
        {
          message: ErrorCodeEnum.TABLE_NOT_FOUND,
          path: ['id'],
          type: 'any.invalid-table-id',
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
  return table;
};

export const tableIdParamSchema = Joi.number()
  .required()
  .external(tableIdExternal);
