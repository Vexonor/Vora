import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { User } from 'src/features/user/entities/user.entity';

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum().messages({
    'string.min': ErrorCodeEnum.USERNAME_TOO_SHORT,
    'string.max': ErrorCodeEnum.USERNAME_TOO_LONG,
    'string.alphanum': ErrorCodeEnum.USERNAME_MUST_BE_ALPHANUMERIC,
    'any.required': ErrorCodeEnum.USERNAME_REQUIRED,
  }),

  email: Joi.string()
    .required()
    .email({ tlds: { allow: ['com', 'id'] } })
    .external(async (value) => {
      const user = await User.findOne({
        where: { email: value },
      });

      if (user) {
        throw new Joi.ValidationError(
          ErrorCodeEnum.EMAIL_ALREADY_REGISTERED,
          [
            {
              message: ErrorCodeEnum.EMAIL_ALREADY_REGISTERED,
              path: ['email'],
              type: ErrorCodeEnum.EMAIL_ALREADY_REGISTERED,
              context: { key: 'email', label: 'email', value },
            },
          ],
          value,
        );
      }
      return value;
    }),

  password: Joi.string()
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
