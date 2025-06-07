
import { apiClient } from './client';
import { FundingResponse } from './types';

export const fundingApi = {
  create: (propertyId: number): Promise<number> => apiClient.createFunding(propertyId),
  getById: (fundingId: number): Promise<FundingResponse> => apiClient.getFundingById(fundingId),
  getMyFundings: (): Promise<FundingResponse[]> => apiClient.getMyFundings(),
  // getPropertyFundings 메소드 제거 (해당 API가 존재하지 않음)
};
