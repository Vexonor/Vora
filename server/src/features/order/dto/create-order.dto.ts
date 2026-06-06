export class OrderItemDto {
  menu_id: number;
  quantity: number;
}

export class CreateOrderDto {
  table_id: number;
  customer_name?: string;
  items: OrderItemDto[];
}
