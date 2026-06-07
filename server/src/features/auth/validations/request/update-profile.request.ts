import * as Joi from 'joi';

export const updateProfileSchema = Joi.object({
  username: Joi.string().trim().min(1).max(100),
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(150),
});
