import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum OrderStatus {
  PENDING = 0,
  PROCESSING = 1,
  READY = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Menunggu',
  [OrderStatus.PROCESSING]: 'Diproses',
  [OrderStatus.READY]: 'Siap Disajikan',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELED]: 'Dibatalkan',
};

export const getOrderStatusLabel = (status: number) =>
  ORDER_STATUS_LABELS[status] ?? UNKNOWN_ENUM_LABEL;

export const getOrderStatusOptions = () => toEnumOptions(ORDER_STATUS_LABELS);
