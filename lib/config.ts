/**
 * Environment configuration for Doubtify frontend
 * Contains API endpoints and configuration settings
 */

// API Base URL - automatically detects environment
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  retryAttempts: 3
}

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register', 
    profile: '/api/auth/profile',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout'
  },
  
  // Doubts
  doubts: {
    list: '/api/doubts',
    create: '/api/doubts',
    byId: (id: number) => `/api/doubts/${id}`,
    vote: (id: number) => `/api/doubts/${id}/vote`,
    resolve: (id: number) => `/api/doubts/${id}/resolve`
  },
  
  // Responses
  responses: {
    byDoubt: (doubtId: number) => `/api/doubts/${doubtId}/responses`,
    create: (doubtId: number) => `/api/doubts/${doubtId}/responses`,
    vote: (id: number) => `/api/responses/${id}/vote`,
    markBest: (id: number) => `/api/responses/${id}/best`
  },
  
  // Users
  users: {
    profile: (id: number) => `/api/users/${id}`,
    reputation: (id: number) => `/api/users/${id}/reputation`
  },
  
  // Subjects
  subjects: {
    list: '/api/subjects'
  },
  
  // Health check
  health: '/health'
}

// Request configuration
export const REQUEST_CONFIG = {
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  
  // Timeout settings
  timeout: API_CONFIG.timeout,
  
  // Retry configuration
  retryDelay: 1000,
  maxRetries: API_CONFIG.retryAttempts
}

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'Your session has expired. Please log in again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timed out. Please try again.'
}

export default API_CONFIG