/**
 * Menu type matching the server Menu entity.
 * Fields: name, cost, price, status (int), status_name (virtual),
 * type (int), type_name (virtual), description, image_path, image_url.
 */
export interface Menu {
  id: number;
  name: string;
  cost: number;
  price: number;
  status: number;
  status_name: string;
  type: number;
  type_name: string;
  description: string;
  image_path: string | null;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Maps to server MenuTypeEnum */
export enum MenuType {
  FOOD = 1,
  HOT_DRINK = 2,
  COLD_DRINK = 3,
  SNACK = 4,
}

/** Maps to server MenuStatusEnum */
export enum MenuStatus {
  INACTIVE = 0,
  AVAILABLE = 1,
  SOLD_OUT = 2,
}

export interface CreateMenuRequest {
  name: string;
  cost: number;
  price: number;
  type: number;
  description?: string;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {}
