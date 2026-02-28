export interface User {
  id: string;
  email: string | undefined;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    email: string | undefined;
    role: string;
  };
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
}
