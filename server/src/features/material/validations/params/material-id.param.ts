import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { Material } from '../../entities/material.entity';

export const materialIdExternal = async (value) => {
  const material = await Material.findByPk(value);
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
  return material;
};

export const materialIdParamSchema = Joi.number()
  .required()
  .external(materialIdExternal);
