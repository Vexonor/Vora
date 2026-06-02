export interface User {
  id: number;
  username: string;
  email: string;
  role: number;
  role_name: string;
  created_at?: string;
  updated_at?: string;
}

/** Maps to server UserRoleEnum */
export enum UserRole {
  CASHIER = 0,
  KITCHEN = 1,
  MANAGER = 2,
}

export const USER_ROLE_LABELS: Record<number, string> = {
  [UserRole.CASHIER]: "Kasir",
  [UserRole.KITCHEN]: "Kitchen",
  [UserRole.MANAGER]: "Manager",
};
