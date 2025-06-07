
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: {
    userId: number;
  };
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string;
  message: string;
  response?: T;
}
