import * as Joi from 'joi';
import { ErrorCodeEnum } from 'src/core/enums/error-code.enum';
import { User } from 'src/features/user/entities/user.entity';
import UserRoleEnum from 'src/features/user/enums/user-role.enum';

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
      const user = await User.findOne({ where: { email: value } });
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

  role: Joi.number()
    .valid(UserRoleEnum.CASHIER, UserRoleEnum.KITCHEN, UserRoleEnum.MANAGER)
    .required()
    .messages({
      'any.required': ErrorCodeEnum.ROLE_REQUIRED,
      'any.only': ErrorCodeEnum.ROLE_INVALID,
    }),
})
  .required()
  .options({ abortEarly: false, errors: { wrap: { label: false } } });
