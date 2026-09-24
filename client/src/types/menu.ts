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

export enum MenuType {
  FOOD = 1,
  HOT_DRINK = 2,
  COLD_DRINK = 3,
  SNACK = 4,
}

export enum MenuStatus {
  INACTIVE = 0,
  AVAILABLE = 1,
  SOLD_OUT = 2,
}
