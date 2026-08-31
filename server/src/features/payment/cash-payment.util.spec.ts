import { resolveCashPayment } from './cash-payment.util';

describe('resolveCashPayment', () => {
  it('menghitung kembalian saat uang yang diterima lebih besar dari total', () => {
    const result = resolveCashPayment(45000, 50000);
    expect(result).toEqual({
      valid: true,
      payment: { total: 45000, paid: 50000, change_amount: 5000 },
    });
  });

  it('menghasilkan kembalian 0 saat uang pas', () => {
    const result = resolveCashPayment(45000, 45000);
    expect(result).toEqual({
      valid: true,
      payment: { total: 45000, paid: 45000, change_amount: 0 },
    });
  });

  it('menolak saat uang yang diterima kurang dari total', () => {
    const result = resolveCashPayment(45000, 40000);
    expect(result.valid).toBe(false);
    expect(result.valid === false && result.message).toContain('kurang');
  });

  // Kolom DECIMAL dibaca Sequelize sebagai string, jadi util harus tahan string.
  it('menerima total dan paid dalam bentuk string', () => {
    const result = resolveCashPayment('45000.000', '50000.000');
    expect(result).toEqual({
      valid: true,
      payment: { total: 45000, paid: 50000, change_amount: 5000 },
    });
  });

  it('membulatkan kembalian ke 3 desimal agar bebas galat floating point', () => {
    const result = resolveCashPayment(0.1, 0.4);
    expect(result.valid === true && result.payment.change_amount).toBe(0.3);
  });

  it('menolak nilai yang bukan angka', () => {
    for (const paid of [undefined, null, '', 'abc', NaN]) {
      const result = resolveCashPayment(45000, paid);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.message).toContain('tidak valid');
    }
  });

  it('menolak nominal negatif', () => {
    const result = resolveCashPayment(45000, -1000);
    expect(result.valid).toBe(false);
    expect(result.valid === false && result.message).toContain('tidak valid');
  });
});