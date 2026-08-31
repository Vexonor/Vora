export interface CashPayment {
  total: number;
  paid: number;
  change_amount: number;
}

export type CashPaymentResult =
  | { valid: true; payment: CashPayment }
  | { valid: false; message: string };

/** Skema uang memakai DECIMAL(16,3), jadi pembulatan mengikuti 3 desimal. */
const round = (value: number) => Math.round(value * 1000) / 1000;

const toAmount = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return round(parsed);
};

/**
 * Aturan pembayaran tunai: uang yang diterima tidak boleh kurang dari total,
 * dan kembalian selalu selisihnya. Dipakai server sebagai sumber kebenaran —
 * UI menghitung ulang hal yang sama hanya untuk pratinjau sebelum submit.
 */
export function resolveCashPayment(
  rawTotal: unknown,
  rawPaid: unknown,
): CashPaymentResult {
  const total = toAmount(rawTotal);
  const paid = toAmount(rawPaid);

  if (total === null || paid === null) {
    return { valid: false, message: 'Jumlah uang yang dibayarkan tidak valid' };
  }

  if (paid < total) {
    const shortage = round(total - paid);
    return {
      valid: false,
      message: `Uang yang dibayarkan kurang Rp ${shortage.toLocaleString('id-ID')} dari total pesanan`,
    };
  }

  return { valid: true, payment: { total, paid, change_amount: round(paid - total) } };
}