export class OrderItemDto {
  menu_id: number;
  quantity: number;
}

export class CreateOrderDto {
  table_id: number;
  items: OrderItemDto[];
}
