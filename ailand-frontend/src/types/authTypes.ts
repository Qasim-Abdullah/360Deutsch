import { User } from "./user";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  user?: User;
  error?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface ResetPassword {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}
