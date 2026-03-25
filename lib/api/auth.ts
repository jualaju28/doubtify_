import { User, LoginCredentials, RegisterData } from '@/types'
import { httpClient } from '@/lib/http-client'
import { API_ENDPOINTS } from '@/lib/config'

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await httpClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.auth.login,
      credentials,
      { requiresAuth: false }
    )

    if (!response.success) {
      throw new Error(response.error || 'Login failed')
    }

    if (response.data?.token) {
      httpClient.setToken(response.data.token)
    }

    return response.data!
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const response = await httpClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.auth.register,
      userData,
      { requiresAuth: false }
    )

    if (!response.success) {
      throw new Error(response.error || 'Registration failed')
    }

    if (response.data?.token) {
      httpClient.setToken(response.data.token)
    }

    return response.data!
  }

  async getProfile(): Promise<User> {
    const response = await httpClient.get<User>(API_ENDPOINTS.auth.profile)

    if (!response.success) {
      if (response.error?.includes('unauthorized') || response.error?.includes('expired')) {
        this.logout()
        throw new Error('Session expired. Please log in again.')
      }
      throw new Error(response.error || 'Failed to fetch profile')
    }

    return response.data!
  }

  async refreshToken(): Promise<string> {
    const response = await httpClient.post<{ token: string }>(API_ENDPOINTS.auth.refresh)

    if (!response.success) {
      this.logout()
      throw new Error('Session expired. Please log in again.')
    }

    if (response.data?.token) {
      httpClient.setToken(response.data.token)
    }

    return response.data!.token
  }

  logout(): void {
    httpClient.clearToken()
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('auth_token')
  }

  async checkHealth(): Promise<boolean> {
    return await httpClient.healthCheck()
  }
}

export const authService = new AuthService()
export default authService