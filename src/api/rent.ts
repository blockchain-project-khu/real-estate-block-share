
import { apiClient } from './client';
import { FundingIncomeApiResponse, MyRentPaymentApiResponse, RentPaymentApiResponse } from './types';

export const rentApi = {
  getFundingIncome: (): Promise<FundingIncomeApiResponse> => apiClient.getFundingIncome(),
  getMyRentPayments: (): Promise<MyRentPaymentApiResponse> => apiClient.getMyRentPayments(),
  payRent: (propertyId: number): Promise<RentPaymentApiResponse> => apiClient.payRent(propertyId),
};
