export enum PaymentTypeEnum {
  ONLINE = 0,
  OFFLINE = 1,
}

export const getPaymentTypeEnumLabel = (paymentTypeEnum: PaymentTypeEnum) => {
  switch (paymentTypeEnum) {
    case PaymentTypeEnum.ONLINE:
      return 'Online';
    case PaymentTypeEnum.OFFLINE:
      return 'Offline';
    default:
      return 'Unknown';
  }
};

export const getPaymentTypeEnums = () => {
  const enums = Object.entries(PaymentTypeEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPaymentTypeEnumLabel(value as PaymentTypeEnum),
      });
    }
  }

  return result;
};

export default PaymentTypeEnum;
