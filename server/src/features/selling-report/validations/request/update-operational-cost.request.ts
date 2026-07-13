import * as Joi from 'joi';

export const updateOperationalCostSchema = Joi.object({
  operational_cost: Joi.number().min(0).required(),
});
