import * as Joi from 'joi';

export const createUnitScheme = Joi.object({
  name: Joi.string().required(),
  abbreviation: Joi.string().required(),
}).options({ abortEarly: false });
