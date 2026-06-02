import * as Joi from 'joi';

export const createOrderSchema = Joi.object({
  table_id: Joi.number().required(),
  items: Joi.array().items(
    Joi.object({
      menu_id: Joi.number().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});
