
import { apiClient } from './client';
import { PropertyRequest, PropertyResponse } from './types';

export const propertyApi = {
  create: (propertyData: PropertyRequest): Promise<PropertyResponse> => apiClient.createProperty(propertyData),
  getAll: (): Promise<PropertyResponse[]> => apiClient.getProperties(),
  getMy: (): Promise<PropertyResponse[]> => apiClient.getMyProperties(),
  getSales: (): Promise<PropertyResponse[]> => apiClient.getSalesProperties(),
  getById: (propertyId: number): Promise<PropertyResponse> => apiClient.getPropertyById(propertyId),
};
