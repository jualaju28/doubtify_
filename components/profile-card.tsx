'use client'

import React from 'react'
import { Trophy, Target, Flame, Medal, Shield, GraduationCap, BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface ProfileCardProps {
  id?: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
  reputation: number
  level?: string
  streakDays?: number
  answeredCount?: number
  avatar?: string
  createdAt?: string
  role?: UserRole
}

const roleBadgeConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  student: {
    label: 'Student',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    icon: BookOpen,
  },
  teaching_assistant: {
    label: 'Teaching Assistant',
    className: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    icon: Shield,
  },
  faculty: {
    label: 'Faculty',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    icon: GraduationCap,
  },
}

export function ProfileCard({
  username,
  firstName,
  lastName,
  reputation,
  level = 'Novice',
  streakDays = 0,
  answeredCount = 0,
  avatar,
  role = 'student',
}: ProfileCardProps) {
  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : username

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : username.substring(0, 2).toUpperCase()

  const badge = roleBadgeConfig[role] || roleBadgeConfig.student
  const BadgeIcon = badge.icon

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar || ""} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-foreground">{displayName}</h3>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">{level} • {reputation.toLocaleString()} rep</span>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", badge.className)}>
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-foreground">Streak</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{streakDays} days</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-foreground">Answered</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{answeredCount}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Rank</span>
          </div>
          <span className="text-sm font-semibold text-foreground">#42</span>
        </div>
      </div>
    </div>
  )
}