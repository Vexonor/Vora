import { resolveOrderPlacement } from './order-placement.util';
import OrderTypeEnum from './enums/order-type.enum';

describe('resolveOrderPlacement', () => {
  it('menerima dine in dengan meja dan tanpa nama pelanggan', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, 3, undefined);
    expect(result).toEqual({
      valid: true,
      placement: { order_type: 0, table_id: 3, customer_name: null },
    });
  });

  it('menyimpan nama pelanggan yang sudah di-trim pada dine in', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, 3, '  Budi  ');
    expect(result.valid === true && result.placement.customer_name).toBe('Budi');
  });

  it('menolak dine in tanpa meja', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, null, 'Budi');
    expect(result.valid).toBe(false);
    expect(result.valid === false && result.message).toContain('meja');
  });

  it('menerima take away tanpa meja selama ada nama pelanggan', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, null, 'Budi');
    expect(result).toEqual({
      valid: true,
      placement: { order_type: 1, table_id: null, customer_name: 'Budi' },
    });
  });

  // Meja tidak boleh ikut tersimpan pada take away, bahkan jika pemanggil
  // mengirimkannya. Kalau lolos, laporan per meja jadi salah.
  it('memaksa table_id null pada take away walaupun dikirimi meja', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, 3, 'Budi');
    expect(result.valid === true && result.placement.table_id).toBeNull();
  });

  it('menolak take away tanpa nama pelanggan', () => {
    for (const name of [undefined, null, '', '   ']) {
      const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, null, name);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.message).toContain('Nama pelanggan');
    }
  });

  it('menganggap tipe yang tidak dikirim sebagai dine in', () => {
    const result = resolveOrderPlacement(undefined, 3, undefined);
    expect(result.valid === true && result.placement.order_type).toBe(0);
  });

  it('menolak tipe pesanan yang tidak dikenal', () => {
    for (const type of [2, -1, 'dine in', {}]) {
      const result = resolveOrderPlacement(type, 3, 'Budi');
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.message).toContain('Tipe pesanan');
    }
  });

  it('menolak table_id yang bukan angka positif pada dine in', () => {
    for (const tableId of ['abc', 0, -3]) {
      const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, tableId, null);
      expect(result.valid).toBe(false);
    }
  });
});