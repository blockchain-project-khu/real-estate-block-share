
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
  monthlyRent: number;
  supplyArea: number;
  totalFloors: string;
  imageUrl: string;
  propertyType: string;
}

export interface PropertyResponse {
  id: number;
  userId: number;
  name: string;
  address: string;
  description: string;
  status: string;
  type: string;
  price: string;
  monthlyRent: number;
  supplyArea: number;
  totalFloors: string;
  imageUrl: string;
  currentFundingPercent: number;
}

export interface PropertyApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: PropertyResponse[];
}

export interface PropertyDetailApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: PropertyResponse;
}

// Extended type for UI usage with additional mock data
export interface PropertyWithMockData extends PropertyResponse {
  propertyType: string;
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

export interface FundingRequest {
  propertyId: number;
}

export interface FundingResponse {
  fundingId: number;
  userId: number;
  propertyId: number;
  amount: number;
  status: string;
}

export interface FundingApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: FundingResponse;
}

export interface FundingListApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: FundingResponse[];
}

export interface FundingCreateApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: number; // fundingId
}

// 새로운 월세 관련 타입들
export interface RentPayment {
  paymentId: number;
  rentId: number;
  userId: number;
  propertyId: number;
  amount: number;
  paidAt: string;
  status: string;
}

export interface FundingIncomeResponse {
  propertyId: number;
  fundingPercentage: number;
  totalIncome: number;
  payments: RentPayment[];
}

export interface FundingIncomeApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: FundingIncomeResponse[];
}

export interface MyRentPaymentApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: RentPayment[];
}

export interface RentPaymentApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  response: RentPayment;
}
