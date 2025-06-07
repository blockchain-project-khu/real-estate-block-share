
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

export interface PropertyRequest {
  name: string;
  address: string;
  description: string;
  price: string;
}

export interface PropertyResponse {
  id: number;
  userId: number;
  name: string;
  address: string;
  description: string;
  price: string;
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string;
  message: string;
  response?: T;
}
