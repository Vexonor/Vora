import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Material } from 'src/features/material/entities/material.entity';

export const createStockScheme = Joi.object({
  material_id: Joi.number()
    .required()
    .external(async (value) => {
      if (value === undefined || value === null) return;
      const material = await Material.findOne({ where: { id: value } });
      if (!material) {
        throw new Joi.ValidationError(
          'any.invalid-material-id',
          [
            {
              message: ErrorCodeEnum.MATERIAL_NOT_FOUND,
              path: ['id'],
              type: 'any.invalid-material-id',
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
    'number.min': ErrorCodeEnum.QUANTITY_MUST_BE_POSITIVE,
  }),
  minimum: Joi.number().required().min(0).messages({
    'number.min': ErrorCodeEnum.QUANTITY_MUST_BE_POSITIVE,
  }),
  maximum: Joi.number().required().min(Joi.ref('minimum')).messages({
    'number.min': ErrorCodeEnum.MAXIMUM_CANNOT_BE_LESS_THAN_MINIMUM,
  }),
}).options({ abortEarly: false });
