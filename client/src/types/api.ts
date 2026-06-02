/**
 * Generic API response envelope from the NestJS backend.
 * Every endpoint returns: { statusCode, message, data }
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Paginated list response used by stock, unit, etc.
 */
export interface PaginatedResponse<T> {
  count: number;
  [key: string]: T[] | number;
}
