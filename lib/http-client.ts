/**
 * HTTP Client utility with automatic token handling and error management
 * Provides a consistent interface for all API calls
 */

import { API_CONFIG, REQUEST_CONFIG, ERROR_MESSAGES } from './config'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  retries?: number
  timeout?: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class HttpClient {
  private baseURL: string
  private defaultTimeout: number

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.defaultTimeout = REQUEST_CONFIG.timeout
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * Set authentication token in localStorage
   */
  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * Clear authentication token from localStorage
   */
  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * Build headers for requests
   */
  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      ...REQUEST_CONFIG.defaultHeaders
    }

    if (options.requiresAuth !== false) {
      const token = this.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Handle HTTP errors and convert to user-friendly messages
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.message || data.error || ERROR_MESSAGES.serverError

        switch (response.status) {
          case 400:
            errorMessage = data.message || ERROR_MESSAGES.validation
            break
          case 401:
            this.clearToken()
            errorMessage = ERROR_MESSAGES.unauthorized
            break
          case 403:
            errorMessage = ERROR_MESSAGES.forbidden
            break
          case 404:
            errorMessage = ERROR_MESSAGES.notFound
            break
          case 500:
          default:
            errorMessage = ERROR_MESSAGES.serverError
            break
        }

        return {
          success: false,
          error: errorMessage,
          data: data
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error('Response parsing error:', error)
      return {
        success: false,
        error: ERROR_MESSAGES.serverError
      }
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      retries = REQUEST_CONFIG.maxRetries,
      timeout = this.defaultTimeout,
      ...requestOptions
    } = options

    const url = `${this.baseURL}${endpoint}`
    const headers = this.buildHeaders(options)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const requestConfig: RequestInit = {
      ...requestOptions,
      headers: {
        ...headers,
        ...requestOptions.headers
      },
      signal: controller.signal
    }

    try {
      const response = await fetch(url, requestConfig)
      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response)
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Handle timeout
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: ERROR_MESSAGES.timeout
        }
      }

      // Handle network errors
      if (error.message === 'Failed to fetch' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: ERROR_MESSAGES.network
        }
      }

      // Retry logic for network errors
      if (retries > 0) {
        console.log(`Retrying request to ${endpoint}. Attempts left: ${retries - 1}`)
        await new Promise(resolve => setTimeout(resolve, REQUEST_CONFIG.retryDelay))
        return this.makeRequest<T>(endpoint, { ...options, retries: retries - 1 })
      }

      console.error('Request failed:', error)
      return {
        success: false,
        error: ERROR_MESSAGES.network
      }
    }
  }

  /**
   * HTTP GET method
   */
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      ...options
    })
  }

  /**
   * HTTP POST method
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    })
  }

  /**
   * HTTP PUT method
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    })
  }

  /**
   * HTTP DELETE method
   */
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * Upload file with multipart/form-data
   */
  public async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const uploadOptions = {
      ...options,
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        ...this.buildHeaders(options)
      }
    }

    // Remove Content-Type to let browser set it
    delete (uploadOptions.headers as any)['Content-Type']

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      ...uploadOptions
    })
  }

  /**
   * Check if server is reachable
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { requiresAuth: false, timeout: 5000 })
      return response.success
    } catch (error) {
      return false
    }
  }
}

// Create singleton instance
export const httpClient = new HttpClient()
export default httpClient