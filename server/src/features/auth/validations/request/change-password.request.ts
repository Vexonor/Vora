import * as Joi from 'joi';
import { ErrorCode } from 'src/core/enums/error-code.enum';

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': ErrorCode.PASSWORD_REQUIRED,
  }),

  new_password: Joi.string()
    .required()
    .min(8)
    .max(64)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
      'string.min': ErrorCode.PASSWORD_TOO_SHORT,
      'string.max': ErrorCode.PASSWORD_TOO_LONG,
      'string.pattern.base': ErrorCode.PASSWORD_TOO_WEAK,
      'any.required': ErrorCode.PASSWORD_REQUIRED,
    }),
})
  .required()
  .options({ abortEarly: false, errors: { wrap: { label: false } } });
