import * as Joi from 'joi';

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().min(1).max(255).required(),
});
