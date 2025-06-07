
import { apiClient } from './client';
import { FundingResponse } from './types';

export const fundingApi = {
  create: (propertyId: number, percentage: number): Promise<number> => apiClient.createFunding(propertyId, percentage),
  getById: (fundingId: number): Promise<FundingResponse> => apiClient.getFundingById(fundingId),
  getMyFundings: (): Promise<FundingResponse[]> => apiClient.getMyFundings(),
  getPropertyFundings: (propertyId: number): Promise<FundingResponse[]> => apiClient.getPropertyFundings(propertyId),
};
