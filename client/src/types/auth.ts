import type { User } from "./user";


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accsess_token: string; // Note: typo from backend, kept for compatibility
}

export interface RegisterRequest {
  username: string;
  email: string;
  role: number;
}

export interface RegisterResponse extends User {
  default_password: string;
}
