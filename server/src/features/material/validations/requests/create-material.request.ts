import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Unit } from 'src/features/unit/entities/unit.entity';

export const createMaterialScheme = Joi.object({
  name: Joi.string().required(),
  unit_id: Joi.number()
    .optional()
    .external(async (value) => {
      if (value === undefined || value === null) return;
      const unit = await Unit.findOne({ where: { id: value } });
      if (!unit) {
        throw new Joi.ValidationError(
          'any.invalid-unit-id',
          [
            {
              message: ErrorCodeEnum.UNIT_NOT_FOUND,
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
}).options({ abortEarly: false });
