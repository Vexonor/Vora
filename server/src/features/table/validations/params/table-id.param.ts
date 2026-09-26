import * as Joi from 'joi';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { DiningTable } from '../../models/dining-table.model';

export const tableIdExternal = async (value) => {
  const table = await DiningTable.findByPk(value);
  if (!table) {
    throw new Joi.ValidationError(
      'any.invalid-table-id',
      [
        {
          message: ErrorCode.TABLE_NOT_FOUND,
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
