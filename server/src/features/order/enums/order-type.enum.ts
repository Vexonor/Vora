import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum OrderType {
  DINE_IN = 0,
  TAKE_AWAY = 1,
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  [OrderType.DINE_IN]: 'Dine In',
  [OrderType.TAKE_AWAY]: 'Take Away',
};

export const getOrderTypeLabel = (type: number) =>
  ORDER_TYPE_LABELS[type as OrderType] ?? UNKNOWN_ENUM_LABEL;

export const getOrderTypeOptions = () => toEnumOptions(ORDER_TYPE_LABELS);
