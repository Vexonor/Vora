import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Unit } from '../../entities/unit.entity';

export const unitIdExternal = async (value) => {
  const unit = await Unit.findByPk(value);
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
  return unit;
};

export const unitIdParamSchema = Joi.number()
  .required()
  .external(unitIdExternal);
