import apiRequest from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  reputation?: {
    total: number;
    doubtsAsked: number;
    responsesGiven: number;
    responsesAccepted: number;
    upvotesReceived: number;
    downvotesReceived: number;
    streakDays: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export const authService = {
  // Register a new user
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    bio?: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success) {
      localStorage.setItem('doubtify_token', response.data.token);
      localStorage.setItem('doubtify_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Login user
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      localStorage.setItem('doubtify_token', response.data.token);
      localStorage.setItem('doubtify_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Get current user info
  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    return await apiRequest('/auth/me');
  },

  // Update password
  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return await apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('doubtify_token');
    localStorage.removeItem('doubtify_user');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('doubtify_token');
  },

  // Get stored user data
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('doubtify_user');
    return userData ? JSON.parse(userData) : null;
  },
};