import * as Joi from 'joi';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { Unit } from 'src/features/unit/models/unit.model';

export const createStockScheme = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name cannot be empty',
  }),
  unit_id: Joi.number()
    .required()
    .external(async (value) => {
      if (value === undefined || value === null) return;
      const unit = await Unit.findOne({ where: { id: value } });
      if (!unit) {
        throw new Joi.ValidationError(
          'any.invalid-unit-id',
          [
            {
              message: ErrorCode.UNIT_NOT_FOUND,
              path: ['id'],
              type: 'any.invalid-unit-id',
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
    }),
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
