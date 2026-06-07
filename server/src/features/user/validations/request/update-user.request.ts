import * as Joi from 'joi';
import UserRoleEnum from '../../enums/user-role.enum';

const roleValues = Object.values(UserRoleEnum).filter(
  (v): v is number => typeof v === 'number',
);

export const updateUserSchema = Joi.object({
  username: Joi.string().trim().min(1).max(100),
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(150),
  role: Joi.number().valid(...roleValues),
}).min(1);
