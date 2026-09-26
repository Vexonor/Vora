import * as Joi from 'joi';

export const saveUnitSchema = Joi.object({
  name: Joi.string().required(),
  abbreviation: Joi.string().required(),
}).options({ abortEarly: false });
