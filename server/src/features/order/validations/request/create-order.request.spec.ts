import { createOrderSchema } from './create-order.request';

const items = [{ menu_id: 1, quantity: 2 }];

describe('createOrderSchema', () => {
  it('memberi default dine in ketika order_type tidak dikirim', () => {
    const { error, value } = createOrderSchema.validate({ table_id: 3, items });
    expect(error).toBeUndefined();
    expect(value.order_type).toBe(0);
  });

  it('menolak dine in tanpa table_id', () => {
    const { error } = createOrderSchema.validate({ order_type: 0, items });
    expect(error?.details[0].context?.key).toBe('table_id');
  });

  it('menerima take away tanpa table_id', () => {
    const { error, value } = createOrderSchema.validate({
      order_type: 1,
      customer_name: 'Budi',
      items,
    });
    expect(error).toBeUndefined();
    expect(value.customer_name).toBe('Budi');
  });

  it('menolak take away tanpa customer_name', () => {
    const { error } = createOrderSchema.validate({ order_type: 1, items });
    expect(error?.details[0].context?.key).toBe('customer_name');
  });

  it('menolak take away dengan customer_name kosong', () => {
    const { error } = createOrderSchema.validate({
      order_type: 1,
      customer_name: '   ',
      items,
    });
    expect(error?.details[0].context?.key).toBe('customer_name');
  });

  it('menolak order_type di luar 0 dan 1', () => {
    const { error } = createOrderSchema.validate({ order_type: 5, table_id: 3, items });
    expect(error?.details[0].context?.key).toBe('order_type');
  });

  it('tetap mewajibkan minimal satu item', () => {
    const { error } = createOrderSchema.validate({ table_id: 3, items: [] });
    expect(error?.details[0].context?.key).toBe('items');
  });
});