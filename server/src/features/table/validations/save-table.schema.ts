import * as Joi from 'joi';

export const saveTableSchema = Joi.object({
  number: Joi.number().required(),
}).options({ abortEarly: false });
