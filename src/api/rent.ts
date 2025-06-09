
import { apiClient } from './client';
import { FundingIncomeApiResponse, MyRentPaymentApiResponse, RentPaymentApiResponse, RentRequest, RentResponse, PropertyResponse, PropertyApiResponse } from './types';

export const rentApi = {
  getFundingIncome: (): Promise<FundingIncomeApiResponse> => apiClient.getFundingIncome(),
  getMyRentPayments: (): Promise<MyRentPaymentApiResponse> => apiClient.getMyRentPayments(),
  payRent: (propertyId: number): Promise<RentPaymentApiResponse> => apiClient.payRent(propertyId),
  createRent: (rentData: RentRequest): Promise<RentResponse> => apiClient.createRent(rentData),
  getMyRents: (): Promise<PropertyResponse[]> => apiClient.getMyRents(),
};
