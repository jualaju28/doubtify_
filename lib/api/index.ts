// API Services - centralized exports
export { authService } from './auth'
export { doubtService } from './doubts' 
export { responseService } from './responses'

// Re-export types for convenience
export type { DoubtsResponse, CreateDoubtData } from './doubts'
export type { ResponsesResponse, CreateResponseData } from './responses'