/**
 * Stock type matching the server Stock entity.
 */
export interface Stock {
  id: number;
  unit_id: number;
  status: number;
  status_name: string;
  quantity: number;
  minimum: number;
  maximum: number;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

/** Maps to server StockStatusEnum */
export enum StockStatus {
  OUT_OF_STOCK = 0,
  IN_STOCK = 1,
  LOW_STOCK = 2,
  DISCONTINUED = 3,
  ON_ORDER = 4,
}

export interface CreateStockRequest {
  name?: string;
  unit_id: number;
  quantity: number;
  minimum: number;
  maximum: number;
}

export interface UpdateStockRequest extends Partial<CreateStockRequest> {}
