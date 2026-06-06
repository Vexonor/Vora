export enum MenuStatusEnum {
  INACTIVE = 0,
  AVAILABLE = 1,
  SOLD_OUT = 2,
}

export const getMenuStatusEnumLabel = (menuStatusEnum: MenuStatusEnum) => {
  switch (menuStatusEnum) {
    case MenuStatusEnum.INACTIVE:
      return 'Tidak Aktif';
    case MenuStatusEnum.AVAILABLE:
      return 'Tersedia';
    case MenuStatusEnum.SOLD_OUT:
      return 'Habis';
    default:
      return 'Unknown';
  }
};

export const getMenuStatusEnums = () => {
  const enums = Object.entries(MenuStatusEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getMenuStatusEnumLabel(value as MenuStatusEnum),
      });
    }
  }

  return result;
};

export default MenuStatusEnum;
