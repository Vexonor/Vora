import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum MenuType {
  FOOD = 1,
  HOT_DRINK = 2,
  COLD_DRINK = 3,
  SNACK = 4,
}

const MENU_TYPE_LABELS: Record<MenuType, string> = {
  [MenuType.FOOD]: 'Makanan',
  [MenuType.HOT_DRINK]: 'Minuman Panas',
  [MenuType.COLD_DRINK]: 'Minuman Dingin',
  [MenuType.SNACK]: 'Cemilan',
};

export const getMenuTypeLabel = (type: number) =>
  MENU_TYPE_LABELS[type] ?? UNKNOWN_ENUM_LABEL;

export const getMenuTypeOptions = () => toEnumOptions(MENU_TYPE_LABELS);
