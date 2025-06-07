
import { apiClient } from './client';
import { PropertyRequest, PropertyResponse } from './types';

export const propertyApi = {
  create: async (propertyData: PropertyRequest): Promise<PropertyResponse> => {
    return apiClient.createProperty(propertyData);
  },

  getAll: async (): Promise<PropertyResponse[]> => {
    return apiClient.getProperties();
  },

  getById: async (propertyId: number): Promise<PropertyResponse> => {
    return apiClient.getPropertyById(propertyId);
  }
};
