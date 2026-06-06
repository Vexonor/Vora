/**
 * Table type matching the server Tables entity.
 * The server entity only has `number` column.
 */
export interface Table {
  id: number;
  number: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTableRequest {
  number: number;
}

export interface UpdateTableRequest {
  number?: number;
}
