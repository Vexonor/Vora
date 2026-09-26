import { TableOptions } from 'sequelize-typescript';

export const SOFT_DELETE_TABLE_OPTIONS: TableOptions = {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
};

export const TIMESTAMP_TABLE_OPTIONS: TableOptions = {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,
};

export const CREATED_AT_ONLY_TABLE_OPTIONS: TableOptions = {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
  paranoid: false,
};
