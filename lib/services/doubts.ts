import apiRequest from './api';

export interface Doubt {
  id: number;
  title: string;
  description: string;
  authorId: number;
  subjectId: number;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  acceptedResponseId?: number;
  viewsCount: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorUsername?: string;
  authorName?: string;
  subjectName?: string;
  responsesCount?: number;
  upvotesCount?: number;
  downvotesCount?: number;
  userRating?: 'upvote' | 'downvote' | null;
}

export interface DoubtFilters {
  page?: number;
  limit?: number;
  status?: string;
  subject?: string;
  author?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedDoubts {
  success: boolean;
  data: {
    doubts: Doubt[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export const doubtService = {
  // Get all doubts with filters and pagination
  async getDoubts(filters: DoubtFilters = {}): Promise<PaginatedDoubts> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = queryParams.toString() ? `/doubts?${queryParams}` : '/doubts';
    return await apiRequest(endpoint);
  },

  // Get a single doubt by ID
  async getDoubt(id: number): Promise<{ success: boolean; data: { doubt: Doubt } }> {
    return await apiRequest(`/doubts/${id}`);
  },

  // Create a new doubt
  async createDoubt(doubtData: {
    title: string;
    description: string;
    subjectId: number;
    tags?: string[];
  }): Promise<{ success: boolean; data: { doubt: Doubt }; message: string }> {
    return await apiRequest('/doubts', {
      method: 'POST',
      body: JSON.stringify(doubtData),
    });
  },

  // Update a doubt
  async updateDoubt(
    id: number,
    updateData: Partial<{
      title: string;
      description: string;
      subjectId: number;
      tags: string[];
    }>
  ): Promise<{ success: boolean; data: { doubt: Doubt }; message: string }> {
    return await apiRequest(`/doubts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a doubt
  async deleteDoubt(id: number): Promise<{ success: boolean; message: string }> {
    return await apiRequest(`/doubts/${id}`, {
      method: 'DELETE',
    });
  },

  // Accept a response
  async acceptResponse(doubtId: number, responseId: number): Promise<{
    success: boolean;
    data: { doubt: Doubt };
    message: string;
  }> {
    return await apiRequest(`/doubts/${doubtId}/accept/${responseId}`, {
      method: 'POST',
    });
  },

  // Get trending doubts
  async getTrending(limit = 10): Promise<{ success: boolean; data: { doubts: Doubt[] } }> {
    return await apiRequest(`/doubts/trending?limit=${limit}`);
  },

  // Get featured doubts
  async getFeatured(limit = 5): Promise<{ success: boolean; data: { doubts: Doubt[] } }> {
    return await apiRequest(`/doubts/featured?limit=${limit}`);
  },
};