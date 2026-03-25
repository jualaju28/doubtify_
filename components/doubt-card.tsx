'use client'

import React from 'react'
import { ThumbsUp, MessageCircle, Eye, CheckCircle2, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface DoubtCardProps {
  id: string
  title: string
  description: string
  subject: string
  author: string
  avatar: string
  upvotes: number
  answers: number
  views: number
  timeAgo: string
  isResolved?: boolean
  hasAnswered?: boolean
}

export function DoubtCard({
  title,
  description,
  subject,
  author,
  avatar,
  upvotes,
  answers,
  views,
  timeAgo,
  isResolved = false,
  hasAnswered = false,
}: DoubtCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="" alt={author} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {avatar}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {subject}
            </span>
            {isResolved && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Resolved</span>
              </div>
            )}
            {hasAnswered && !isResolved && (
              <div className="flex items-center gap-1 text-blue-600">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Answered</span>
              </div>
            )}
          </div>

          <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>{upvotes}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{answers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="font-medium hover:text-primary transition-colors">{author}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}