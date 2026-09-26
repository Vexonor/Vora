import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum PaymentType {
  ONLINE = 0,
  OFFLINE = 1,
}

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.ONLINE]: 'Online',
  [PaymentType.OFFLINE]: 'Offline',
};

export const getPaymentTypeLabel = (type: number) =>
  PAYMENT_TYPE_LABELS[type as PaymentType] ?? UNKNOWN_ENUM_LABEL;

export const getPaymentTypeOptions = () => toEnumOptions(PAYMENT_TYPE_LABELS);
