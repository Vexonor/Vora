import OrderTypeEnum from './enums/order-type.enum';

export interface OrderPlacement {
  order_type: OrderTypeEnum;
  table_id: number | null;
  customer_name: string | null;
}

export type OrderPlacementResult =
  | { valid: true; placement: OrderPlacement }
  | { valid: false; message: string };

const toTableId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const toName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

/**
 * Aturan penempatan pesanan. Dine In terikat meja; Take Away tidak punya meja
 * sehingga nama pelanggan menjadi identitas penggantinya. Dipakai skema Joi dan
 * OrderService agar permintaan langsung ke API tidak bisa menembus aturan.
 */
export function resolveOrderPlacement(
  rawType: unknown,
  rawTableId: unknown,
  rawCustomerName: unknown,
): OrderPlacementResult {
  const type =
    rawType === null || rawType === undefined
      ? OrderTypeEnum.DINE_IN
      : Number(rawType);

  if (type !== OrderTypeEnum.DINE_IN && type !== OrderTypeEnum.TAKE_AWAY) {
    return { valid: false, message: 'Tipe pesanan tidak dikenal' };
  }

  const customer_name = toName(rawCustomerName);

  if (type === OrderTypeEnum.TAKE_AWAY) {
    if (!customer_name) {
      return {
        valid: false,
        message: 'Nama pelanggan wajib diisi untuk pesanan Take Away',
      };
    }
    return {
      valid: true,
      placement: { order_type: type, table_id: null, customer_name },
    };
  }

  const table_id = toTableId(rawTableId);
  if (table_id === null) {
    return {
      valid: false,
      message: 'Nomor meja wajib dipilih untuk pesanan Dine In',
    };
  }

  return { valid: true, placement: { order_type: type, table_id, customer_name } };
}