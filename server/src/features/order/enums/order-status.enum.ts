export enum OrderStatusEnum {
  PENDING = 0,
  PROCESSING = 1,
  READY = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export const getOrderStatusEnumLabel = (orderStatusEnum: OrderStatusEnum) => {
  switch (orderStatusEnum) {
    case OrderStatusEnum.PENDING:
      return 'Menunggu';
    case OrderStatusEnum.PROCESSING:
      return 'Diproses';
    case OrderStatusEnum.READY:
      return 'Siap Disajikan';
    case OrderStatusEnum.COMPLETED:
      return 'Selesai';
    case OrderStatusEnum.CANCELED:
      return 'Dibatalkan';
    default:
      return 'Unknown';
  }
};

export const getOrderStatusEnums = () => {
  const enums = Object.entries(OrderStatusEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getOrderStatusEnumLabel(value as OrderStatusEnum),
      });
    }
  }

  return result;
};

export default OrderStatusEnum;
