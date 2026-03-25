import { Doubt, Subject } from '@/types'
import { httpClient } from '@/lib/http-client'
import { API_ENDPOINTS } from '@/lib/config'

export interface DoubtsResponse {
  doubts: Doubt[]
  total: number
  page: number
  totalPages: number
}

export interface CreateDoubtData {
  title: string
  description: string
  subjectId: number
  tags?: string[]
}

class DoubtService {
  async getDoubts(params?: {
    page?: number
    limit?: number
    subject?: string
    search?: string
    status?: 'all' | 'open' | 'resolved'
    sortBy?: 'newest' | 'oldest' | 'popular' | 'trending'
  }): Promise<DoubtsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `${API_ENDPOINTS.doubts.list}?${queryParams.toString()}`
    const response = await httpClient.get<DoubtsResponse>(endpoint)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch doubts')
    }

    return response.data!
  }

  async getDoubtById(id: number): Promise<Doubt> {
    const response = await httpClient.get<Doubt>(API_ENDPOINTS.doubts.byId(id))

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch doubt')
    }

    return response.data!
  }

  async createDoubt(doubtData: CreateDoubtData): Promise<Doubt> {
    const response = await httpClient.post<Doubt>(
      API_ENDPOINTS.doubts.create,
      doubtData
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to create doubt')
    }

    return response.data!
  }

  async voteOnDoubt(id: number, voteType: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number }> {
    const response = await httpClient.put<{ upvotes: number; downvotes: number }>(
      API_ENDPOINTS.doubts.vote(id),
      { type: voteType }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to vote on doubt')
    }

    return response.data!
  }

  async resolveDoubt(id: number, responseId?: number): Promise<Doubt> {
    const response = await httpClient.put<Doubt>(
      API_ENDPOINTS.doubts.resolve(id),
      { responseId }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to resolve doubt')
    }

    return response.data!
  }

  async getSubjects(): Promise<Subject[]> {
    const response = await httpClient.get<Subject[]>(
      API_ENDPOINTS.subjects.list,
      { requiresAuth: false }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch subjects')
    }

    return response.data!
  }

  async searchDoubts(query: string, filters?: {
    subject?: string
    tags?: string[]
    dateRange?: { start: string; end: string }
  }): Promise<DoubtsResponse> {
    const searchParams = new URLSearchParams({
      search: query,
      ...(filters?.subject && { subject: filters.subject }),
      ...(filters?.tags && { tags: filters.tags.join(',') }),
      ...(filters?.dateRange && { 
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      })
    })

    const endpoint = `${API_ENDPOINTS.doubts.list}?${searchParams.toString()}`
    const response = await httpClient.get<DoubtsResponse>(endpoint)

    if (!response.success) {
      throw new Error(response.error || 'Failed to search doubts')
    }

    return response.data!
  }
}

export const doubtService = new DoubtService()
export default doubtService