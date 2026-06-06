export enum MenuTypeEnum {
  FOOD = 1,
  HOT_DRINK = 2,
  COLD_DRINK = 3,
  SNACK = 4,
}

export const getMenuTypeEnumLabel = (menuTypeEnum: MenuTypeEnum) => {
  switch (menuTypeEnum) {
    case MenuTypeEnum.FOOD:
      return 'Makanan';
    case MenuTypeEnum.HOT_DRINK:
      return 'Minuman Panas';
    case MenuTypeEnum.COLD_DRINK:
      return 'Minuman Dingin';
    case MenuTypeEnum.SNACK:
      return 'Cemilan';
    default:
      return 'Unknown';
  }
};

export const getMenuTypeEnums = () => {
  const enums = Object.entries(MenuTypeEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getMenuTypeEnumLabel(value as MenuTypeEnum),
      });
    }
  }

  return result;
};

export default MenuTypeEnum;
