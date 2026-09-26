import * as Joi from 'joi';
import { OrderStatus, getOrderStatusOptions } from '../../enums/order-status.enum';

const validStatuses = getOrderStatusOptions().map(e => e.id);

export const updateOrderStatusSchema = Joi.object({
  status: Joi.number().valid(...validStatuses).required(),
});
