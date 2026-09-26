import { StockStatus } from '../enums/stock-status.enum';
import { Stock } from './stock.model';

describe('Stock.resolveStatus', () => {
  it('menandai habis ketika jumlah 0 atau kurang', () => {
    expect(Stock.resolveStatus(StockStatus.IN_STOCK, 0, 10)).toBe(
      StockStatus.OUT_OF_STOCK,
    );
  });

  it('menandai menipis ketika jumlah tidak melebihi batas minimum', () => {
    expect(Stock.resolveStatus(StockStatus.IN_STOCK, 10, 10)).toBe(
      StockStatus.LOW_STOCK,
    );
  });

  it('menandai tersedia ketika jumlah di atas batas minimum', () => {
    expect(Stock.resolveStatus(StockStatus.OUT_OF_STOCK, 11, 10)).toBe(
      StockStatus.IN_STOCK,
    );
  });

  it('mempertahankan status tidak aktif berapa pun jumlahnya', () => {
    expect(Stock.resolveStatus(StockStatus.DISCONTINUED, 50, 10)).toBe(
      StockStatus.DISCONTINUED,
    );
  });

  it('menghitung ulang status manual selain tidak aktif', () => {
    expect(Stock.resolveStatus(StockStatus.ON_ORDER, 50, 10)).toBe(
      StockStatus.IN_STOCK,
    );
  });

  it('menerima nilai DECIMAL/BIGINT yang dibaca sebagai string', () => {
    expect(
      Stock.resolveStatus(
        '3' as unknown as number,
        5,
        '10' as unknown as number,
      ),
    ).toBe(StockStatus.DISCONTINUED);
    expect(
      Stock.resolveStatus(StockStatus.IN_STOCK, 5, '10' as unknown as number),
    ).toBe(StockStatus.LOW_STOCK);
  });
});
