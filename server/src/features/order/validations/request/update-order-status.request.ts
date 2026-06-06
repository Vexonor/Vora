import * as Joi from 'joi';
import OrderStatusEnum, { getOrderStatusEnums } from '../../enums/order-status.enum';

const validStatuses = getOrderStatusEnums().map(e => e.id);

export const updateOrderStatusSchema = Joi.object({
  status: Joi.number().valid(...validStatuses).required(),
});
