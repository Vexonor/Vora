import * as Joi from 'joi';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { Unit } from 'src/features/unit/models/unit.model';
import { getStockStatusOptions } from '../enums/stock-status.enum';

const STOCK_STATUS_VALUES = getStockStatusOptions().map(({ id }) => id);

const assertUnitExists = async (unitId: number) => {
  if (await Unit.findByPk(unitId)) return;

  throw new Joi.ValidationError(
    ErrorCode.UNIT_NOT_FOUND,
    [
      {
        message: ErrorCode.UNIT_NOT_FOUND,
        path: ['unit_id'],
        type: 'any.invalid-unit-id',
        context: { key: 'unit_id', label: 'unit_id', value: unitId },
      },
    ],
    unitId,
  );
};

export const createStockSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name cannot be empty',
  }),
  unit_id: Joi.number().required().external(assertUnitExists),
  quantity: Joi.number().required().min(0).messages({
    'number.min': ErrorCode.QUANTITY_MUST_BE_POSITIVE,
  }),
  minimum: Joi.number().required().min(0).messages({
    'number.min': ErrorCode.QUANTITY_MUST_BE_POSITIVE,
  }),
  maximum: Joi.number().required().min(Joi.ref('minimum')).messages({
    'number.min': ErrorCode.MAXIMUM_CANNOT_BE_LESS_THAN_MINIMUM,
  }),
}).options({ abortEarly: false });

export const updateStockSchema = createStockSchema.keys({
  status: Joi.number()
    .optional()
    .valid(...STOCK_STATUS_VALUES),
});
