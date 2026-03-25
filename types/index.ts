export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  reputation?: {
    total: number
    streakDays: number
    responsesGiven: number
  }
  level?: string
  streakDays?: number
  answeredCount?: number
  createdAt: string
  updatedAt?: string
}

export interface Doubt {
  id: number
  title: string
  description: string
  author: string
  avatar: string
  subject: string
  upvotes: number
  answers: number
  views: number
  timeAgo: string
  isResolved: boolean
  hasAnswered: boolean
  userId: number
  subjectId: number
  createdAt: string
  updatedAt: string
  status: 'open' | 'resolved'
  tags: string[]
  viewCount: number
  responseCount: number
  rating: {
    upvotes: number
    downvotes: number
  }
}

export interface Response {
  id: number
  content: string
  author: string
  avatar: string
  upvotes: number
  downvotes: number
  isBestAnswer: boolean
  timeAgo: string
  createdAt: string
  updatedAt: string
  userId: number
  doubtId: number
}

export interface Subject {
  id: number
  name: string
  description?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}