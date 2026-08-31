export class OrderItemDto {
  menu_id: number;
  quantity: number;
}

export class CreateOrderDto {
  order_type?: number;
  table_id?: number;
  customer_name?: string;
  items: OrderItemDto[];
}