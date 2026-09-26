import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum StockStatus {
  OUT_OF_STOCK = 0,
  IN_STOCK = 1,
  LOW_STOCK = 2,
  DISCONTINUED = 3,
  ON_ORDER = 4,
}

const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  [StockStatus.OUT_OF_STOCK]: 'Habis',
  [StockStatus.IN_STOCK]: 'Tersedia',
  [StockStatus.LOW_STOCK]: 'Menipis',
  [StockStatus.DISCONTINUED]: 'Tidak Aktif',
  [StockStatus.ON_ORDER]: 'Menunggu Supplier',
};

export const getStockStatusLabel = (status: number) =>
  STOCK_STATUS_LABELS[status] ?? UNKNOWN_ENUM_LABEL;

export const getStockStatusOptions = () => toEnumOptions(STOCK_STATUS_LABELS);
