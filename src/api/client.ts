
import { LoginRequest, RegisterRequest, LoginResponse } from './types';

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
        
        // refresh 토큰은 Set-Cookie로 받아서 자동으로 브라우저가 관리
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

      // 401 에러 발생 시 토큰 재발급 시도
      if (response.status === 401 && requiresAuth) {
        const reissueSuccess = await this.reissueTokens();
        
        if (reissueSuccess) {
          // 새로운 토큰으로 다시 요청
          const { access } = this.getStoredTokens();
          if (access) {
            headers.access = access;
          }
          
          response = await fetch(url, {
            ...requestOptions,
            headers
          });
        } else {
          // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로그인 성공 시 토큰 저장
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

  // 인증 관련 API 메소드들
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

  // 향후 매물 관련 API 메소드들을 여기에 추가할 예정
}

export const apiClient = new ApiClient(BASE_URL);
