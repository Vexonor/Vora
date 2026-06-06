import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': ErrorCodeEnum.PASSWORD_REQUIRED,
  }),

  new_password: Joi.string()
    .required()
    .min(8)
    .max(64)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
      'string.min': ErrorCodeEnum.PASSWORD_TOO_SHORT,
      'string.max': ErrorCodeEnum.PASSWORD_TOO_LONG,
      'string.pattern.base': ErrorCodeEnum.PASSWORD_TOO_WEAK,
      'any.required': ErrorCodeEnum.PASSWORD_REQUIRED,
    }),
})
  .required()
  .options({ abortEarly: false, errors: { wrap: { label: false } } });
