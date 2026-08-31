export enum OrderTypeEnum {
  DINE_IN = 0,
  TAKE_AWAY = 1,
}

export const getOrderTypeEnumLabel = (orderTypeEnum: OrderTypeEnum) => {
  switch (orderTypeEnum) {
    case OrderTypeEnum.DINE_IN:
      return 'Dine In';
    case OrderTypeEnum.TAKE_AWAY:
      return 'Take Away';
    default:
      return 'Unknown';
  }
};

export const getOrderTypeEnums = () => {
  const enums = Object.entries(OrderTypeEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getOrderTypeEnumLabel(value as OrderTypeEnum),
      });
    }
  }

  return result;
};

export default OrderTypeEnum;