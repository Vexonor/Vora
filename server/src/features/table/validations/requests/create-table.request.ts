import * as Joi from 'joi';

export const createTableScheme = Joi.object({
  number: Joi.number().required(),
}).options({ abortEarly: false });
