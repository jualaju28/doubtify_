import { Response, User } from '@/types'
import { httpClient } from '@/lib/http-client'
import { API_ENDPOINTS } from '@/lib/config'

export interface ResponsesResponse {
  responses: Response[]
  total: number
}

export interface CreateResponseData {
  content: string
  doubtId: number
}

class ResponseService {
  async getResponsesForDoubt(doubtId: number): Promise<ResponsesResponse> {
    const response = await httpClient.get<ResponsesResponse>(
      API_ENDPOINTS.responses.byDoubt(doubtId)
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch responses')
    }

    return response.data!
  }

  async createResponse(responseData: CreateResponseData): Promise<Response> {
    const { doubtId, ...data } = responseData
    const response = await httpClient.post<Response>(
      API_ENDPOINTS.responses.create(doubtId),
      data
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to create response')
    }

    return response.data!
  }

  async voteOnResponse(id: number, voteType: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number }> {
    const response = await httpClient.put<{ upvotes: number; downvotes: number }>(
      API_ENDPOINTS.responses.vote(id),
      { type: voteType }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to vote on response')
    }

    return response.data!
  }

  async markAsBest(id: number): Promise<Response> {
    const response = await httpClient.put<Response>(
      API_ENDPOINTS.responses.markBest(id)
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to mark response as best')
    }

    return response.data!
  }
}

export const responseService = new ResponseService()
export default responseService