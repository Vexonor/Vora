import { Op, Order, WhereOptions } from 'sequelize';

export interface ListQuery {
  q?: unknown;
  page?: unknown;
  limit?: unknown;
  order_by?: unknown;
  direction?: unknown;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const toPositiveInteger = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const toPagination = ({ page, limit }: ListQuery) => {
  if (page === undefined && limit === undefined) return {};

  const pageSize = Math.min(
    toPositiveInteger(limit) ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );
  const pageNumber = toPositiveInteger(page) ?? 1;
  return { limit: pageSize, offset: (pageNumber - 1) * pageSize };
};

export const toSortOrder = (
  { order_by, direction }: ListQuery,
  sortableFields: readonly string[],
): Order => {
  if (typeof order_by !== 'string' || !sortableFields.includes(order_by)) {
    return [];
  }
  const isDescending =
    typeof direction === 'string' && direction.toUpperCase() === 'DESC';
  return [[order_by, isDescending ? 'DESC' : 'ASC']];
};

export const toSearchCondition = (
  q: unknown,
  searchableFields: readonly string[],
): WhereOptions => {
  const term = typeof q === 'string' ? q.trim() : '';
  if (!term) return {};
  return {
    [Op.or]: searchableFields.map((field) => ({
      [field]: { [Op.like]: `%${term}%` },
    })),
  };
};

export const toNumberList = (value: unknown): number[] | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;

  let parsed: unknown = value;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = value;
  }

  const numbers = (Array.isArray(parsed) ? parsed : [parsed])
    .map(Number)
    .filter(Number.isFinite);
  return numbers.length > 0 ? numbers : undefined;
};
