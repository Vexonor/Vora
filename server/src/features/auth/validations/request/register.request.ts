import * as Joi from 'joi';
import { ErrorCode } from 'src/core/enums/error-code.enum';
import { User } from 'src/features/user/models/user.model';
import { UserRole } from 'src/features/user/enums/user-role.enum';

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum().messages({
    'string.min': ErrorCode.USERNAME_TOO_SHORT,
    'string.max': ErrorCode.USERNAME_TOO_LONG,
    'string.alphanum': ErrorCode.USERNAME_MUST_BE_ALPHANUMERIC,
    'any.required': ErrorCode.USERNAME_REQUIRED,
  }),

  email: Joi.string()
    .required()
    .email({ tlds: { allow: ['com', 'id'] } })
    .external(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Joi.ValidationError(
          ErrorCode.EMAIL_ALREADY_REGISTERED,
          [
            {
              message: ErrorCode.EMAIL_ALREADY_REGISTERED,
              path: ['email'],
              type: ErrorCode.EMAIL_ALREADY_REGISTERED,
              context: { key: 'email', label: 'email', value },
            },
          ],
          value,
        );
      }
      return value;
    }),

  role: Joi.number()
    .valid(UserRole.CASHIER, UserRole.KITCHEN, UserRole.MANAGER)
    .required()
    .messages({
      'any.required': ErrorCode.ROLE_REQUIRED,
      'any.only': ErrorCode.ROLE_INVALID,
    }),
})
  .required()
  .options({ abortEarly: false, errors: { wrap: { label: false } } });
