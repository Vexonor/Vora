import * as Joi from 'joi';
import { User } from 'src/features/user/entities/user.entity';

const REQ = '{#label} Wajib Diisi';
const EMPTY = '{#label} Tidak Boleh Kosong';

export const registerSchema = Joi.object({
  name: Joi.string().required().label('Nama')
    .messages({
      'any.required': REQ,
      'string.empty': EMPTY
    }),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: ['com', 'id'] } }) 
    .label('Email')
    .messages({
      'any.required': REQ,
      'string.empty': EMPTY,
      'string.email': 'Format {#label} tidak valid',
    })
    .external(async (value) => {
      const user = await User.findOne({
        where: { email: value },
      });
      if (user) {
        throw new Joi.ValidationError(
          'any.email-exists',
          [
            {
              message: 'Email sudah terdaftar',
              path: ['email'],
              type: 'any.email-exists',
              context: {
                key: 'email',
                label: 'email',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  password: Joi.string().required().min(8).label('Password')
    .messages({
      'any.required': REQ,
      'string.empty': EMPTY,
      'string.min': '{#label} minimal {#limit} karakter',
    }),
}).options({ abortEarly: false, errors: { wrap: { label: false } } });
