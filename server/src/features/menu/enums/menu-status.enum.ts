import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum MenuStatus {
  INACTIVE = 0,
  AVAILABLE = 1,
  SOLD_OUT = 2,
}

const MENU_STATUS_LABELS: Record<MenuStatus, string> = {
  [MenuStatus.INACTIVE]: 'Tidak Aktif',
  [MenuStatus.AVAILABLE]: 'Tersedia',
  [MenuStatus.SOLD_OUT]: 'Habis',
};

export const getMenuStatusLabel = (status: number) =>
  MENU_STATUS_LABELS[status] ?? UNKNOWN_ENUM_LABEL;

export const getMenuStatusOptions = () => toEnumOptions(MENU_STATUS_LABELS);
