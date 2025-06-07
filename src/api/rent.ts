
import { apiClient } from './client';
import { RentRequest, RentResponse, RentPaymentRequest, RentPaymentResponse, PropertyPaymentStatus } from './types';

export const rentApi = {
  create: (rentData: RentRequest): Promise<RentResponse> => apiClient.createRent(rentData),
  getMyRents: (): Promise<RentResponse[]> => apiClient.getMyRents(),
  payRent: (paymentData: RentPaymentRequest): Promise<RentPaymentResponse> => apiClient.payRent(paymentData),
  getPropertyPaymentStatus: (): Promise<PropertyPaymentStatus[]> => apiClient.getPropertyPaymentStatus(),
  getMyPayments: (): Promise<any[]> => apiClient.getMyPayments(),
};
