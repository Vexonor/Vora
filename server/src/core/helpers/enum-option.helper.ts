export interface EnumOption {
  id: number;
  name: string;
}

export const UNKNOWN_ENUM_LABEL = 'Unknown';

export const toEnumOptions = (labels: Record<number, string>): EnumOption[] =>
  Object.entries(labels).map(([id, name]) => ({ id: Number(id), name }));
