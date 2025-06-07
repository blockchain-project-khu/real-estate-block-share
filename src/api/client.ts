
import { LoginRequest, RegisterRequest, LoginResponse, PropertyRequest, PropertyResponse, PropertyApiResponse, PropertyDetailApiResponse, FundingResponse, FundingApiResponse, FundingListApiResponse, FundingCreateApiResponse, RentRequest, RentResponse, RentApiResponse, RentListApiResponse, RentPaymentRequest, RentPaymentApiResponse } from './types';

const BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getStoredTokens() {
    return {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh')
    };
  }

  private setTokens(access?: string, refresh?: string) {
    if (access) {
      localStorage.setItem('access', access);
    }
    if (refresh) {
      localStorage.setItem('refresh', refresh);
    }
  }

  private clearTokens() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  private async reissueTokens(): Promise<boolean> {
    try {
      const { access, refresh } = this.getStoredTokens();
      
      if (!access || !refresh) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/reissue`, {
        method: 'POST',
        headers: {
          'access': access,
          'refresh': refresh,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const newAccess = response.headers.get('access');
        const setCookieHeader = response.headers.get('Set-Cookie');
        
        if (newAccess) {
          this.setTokens(newAccess);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token reissue failed:', error);
      return false;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (requiresAuth) {
      const { access } = this.getStoredTokens();
      if (access) {
        headers.access = access;
      }
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include'
    };

    try {
      let response = await fetch(url, requestOptions);

      if (response.status === 401 && requiresAuth) {
        const reissueSuccess = await this.reissueTokens();
        
        if (reissueSuccess) {
          const { access } = this.getStoredTokens();
          if (access) {
            headers.access = access;
          }
          
          response = await fetch(url, {
            ...requestOptions,
            headers
          });
        } else {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (endpoint === '/login' && response.ok) {
        const access = response.headers.get('access');
        if (access) {
          this.setTokens(access);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  async register(userData: RegisterRequest): Promise<void> {
    return this.makeRequest<void>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async logout() {
    this.clearTokens();
  }

  async createProperty(propertyData: PropertyRequest): Promise<PropertyResponse> {
    return this.makeRequest<PropertyResponse>('/property', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async getProperties(): Promise<PropertyResponse[]> {
    const response = await this.makeRequest<PropertyApiResponse>('/property');
    return response.response;
  }

  async getMyProperties(): Promise<PropertyResponse[]> {
    const response = await this.makeRequest<PropertyApiResponse>('/property/my');
    return response.response;
  }

  async getSalesProperties(): Promise<PropertyResponse[]> {
    return this.makeRequest<PropertyResponse[]>('/property/sales');
  }

  async getPropertyById(propertyId: number): Promise<PropertyResponse> {
    const response = await this.makeRequest<PropertyDetailApiResponse>(`/property/${propertyId}`);
    return response.response;
  }

  async createFunding(propertyId: number, percentage: number): Promise<number> {
    const response = await this.makeRequest<FundingCreateApiResponse>(`/fundings/properties/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify({ percentage }),
    });
    return response.response;
  }

  async getFundingById(fundingId: number): Promise<FundingResponse> {
    const response = await this.makeRequest<FundingApiResponse>(`/fundings/${fundingId}`);
    return response.response;
  }

  async getMyFundings(): Promise<FundingResponse[]> {
    console.log('API Client: getMyFundings 호출');
    const response = await this.makeRequest<FundingListApiResponse>('/fundings/me');
    console.log('API Client: getMyFundings 응답:', response);
    return response.response;
  }

  async getPropertyFundings(propertyId: number): Promise<FundingResponse[]> {
    console.log('API Client: getPropertyFundings 호출, propertyId:', propertyId);
    const response = await this.makeRequest<FundingListApiResponse>(`/fundings/property/${propertyId}`);
    console.log('API Client: getPropertyFundings 응답:', response);
    return response.response;
  }

  // 임대 관련 메서드들
  async createRent(rentData: RentRequest): Promise<RentResponse> {
    console.log('API Client: createRent 호출, rentData:', rentData);
    const response = await this.makeRequest<RentApiResponse>('/rents', {
      method: 'POST',
      body: JSON.stringify(rentData),
    });
    console.log('API Client: createRent 응답:', response);
    return response.response;
  }

  async getMyRents(): Promise<RentResponse[]> {
    console.log('API Client: getMyRents 호출');
    const response = await this.makeRequest<RentListApiResponse>('/rents/me');
    console.log('API Client: getMyRents 응답:', response);
    return response.response;
  }

  async payRent(paymentData: RentPaymentRequest): Promise<RentPaymentApiResponse> {
    console.log('API Client: payRent 호출, paymentData:', paymentData);
    const response = await this.makeRequest<RentPaymentApiResponse>('/rent-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    console.log('API Client: payRent 응답:', response);
    return response;
  }
}

export const apiClient = new ApiClient(BASE_URL);
