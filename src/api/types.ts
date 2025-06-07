
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

// Extended type for UI usage with mock data
export interface PropertyWithMockData extends PropertyResponse {
  imageUrl: string;
  propertyType: string;
  monthlyRent: number;
  fundingProgress: number;
  totalArea?: string;
  floor?: string;
  buildingAge?: string;
  facilities?: string[];
  expectedYield?: number;
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string;
  message: string;
  response?: T;
}
