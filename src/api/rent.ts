
import { apiClient } from './client';
import { RentRequest, RentResponse, RentPaymentRequest, RentPaymentResponse } from './types';

export const rentApi = {
  create: (rentData: RentRequest): Promise<RentResponse> => apiClient.createRent(rentData),
  getMyRents: (): Promise<RentResponse[]> => apiClient.getMyRents(),
  payRent: (paymentData: RentPaymentRequest): Promise<RentPaymentResponse> => apiClient.payRent(paymentData),
};
