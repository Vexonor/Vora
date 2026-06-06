import * as Joi from 'joi';

export const createSellingReportSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Tanggal harus berformat YYYY-MM-DD',
  }),
  total_transaction: Joi.number().integer().min(0).required(),
  total_items_sold: Joi.number().integer().min(0).required(),
  unit_cost: Joi.number().min(0).required(),
  gross_revenue: Joi.number().min(0).required(),
  net_profit: Joi.number().required(), // boleh negatif (kerugian)
});
