import Joi from 'joi';
import { getStockStatusEnums } from '../../enums/stock-status.enum';
import { createStockScheme } from './create-stock.request';

const validStatusEnums = getStockStatusEnums().map((item) => +item.id);

export const updateStockScheme = Joi.object({
  status: Joi.number()
    .optional()
    .valid(...validStatusEnums),
}).concat(createStockScheme);
