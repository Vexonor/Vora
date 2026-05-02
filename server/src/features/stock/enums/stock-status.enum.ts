export enum StockStatusEnum {
  OUT_OF_STOCK = 0,
  IN_STOCK = 1,
  LOW_STOCK = 2,
  DISCONTINUED = 3,
  ON_ORDER = 4
}

export const getStockStatusEnumLabel = (stockStatusEnum: StockStatusEnum) => {
  switch (stockStatusEnum) {
    case StockStatusEnum.OUT_OF_STOCK:
      return "Habis";
    case StockStatusEnum.IN_STOCK:
      return "Tersedia";
    case StockStatusEnum.LOW_STOCK:
      return "Menipis";
    case StockStatusEnum.DISCONTINUED:
      return "Tidak Aktif";
    case StockStatusEnum.ON_ORDER:
      return "Menunggu Supplier";
    default:
      return "Unknown";
  }
};

export const getStockStatusEnums = () => {
  const enums = Object.entries(StockStatusEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === "number") {
      result.push({
        id: value,
        name: getStockStatusEnumLabel(value as StockStatusEnum),
      });
    }
  }

  return result;
};

export default StockStatusEnum;