import * as Joi from 'joi';
import OrderTypeEnum from '../../enums/order-type.enum';

export const createOrderSchema = Joi.object({
  order_type: Joi.number()
    .valid(OrderTypeEnum.DINE_IN, OrderTypeEnum.TAKE_AWAY)
    .default(OrderTypeEnum.DINE_IN),
  table_id: Joi.number().when('order_type', {
    is: OrderTypeEnum.TAKE_AWAY,
    then: Joi.optional().allow(null),
    otherwise: Joi.required(),
  }),
  customer_name: Joi.string().trim().max(100).when('order_type', {
    is: OrderTypeEnum.TAKE_AWAY,
    then: Joi.required(),
    otherwise: Joi.allow('', null).optional(),
  }),
  items: Joi.array().items(
    Joi.object({
      menu_id: Joi.number().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});