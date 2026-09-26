import {
  toEnumOptions,
  UNKNOWN_ENUM_LABEL,
} from 'src/core/helpers/enum-option.helper';

export enum UserRole {
  CASHIER = 0,
  KITCHEN = 1,
  MANAGER = 2,
}

export const STAFF_ROLES = [
  UserRole.CASHIER,
  UserRole.KITCHEN,
  UserRole.MANAGER,
];

const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CASHIER]: 'Cashier',
  [UserRole.KITCHEN]: 'Kitchen',
  [UserRole.MANAGER]: 'Manager',
};

export const getUserRoleLabel = (role: number) =>
  USER_ROLE_LABELS[role as UserRole] ?? UNKNOWN_ENUM_LABEL;

export const getUserRoleOptions = () => toEnumOptions(USER_ROLE_LABELS);
