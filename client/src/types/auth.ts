import type { User } from "./user";


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  role: number;
}

export interface RegisterResponse extends User {
  default_password: string;
}
