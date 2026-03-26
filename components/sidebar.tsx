'use client'

import React from 'react'
import { Home, MessageSquare, Users, BookOpen, Trophy, Settings, HelpCircle, AlertCircle, Shield, BarChart3, TrendingUp, LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole, User } from '@/types'

// Role-based navigation configs
const studentNav = [
  { name: 'Dashboard', icon: Home, href: '/', current: true },
  { name: 'My Doubts', icon: MessageSquare, href: '/doubts', current: false },
  { name: 'Community', icon: Users, href: '/community', current: false },
  { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge', current: false },
  { name: 'Leaderboard', icon: Trophy, href: '/leaderboard', current: false },
  { name: 'Help', icon: HelpCircle, href: '/help', current: false },
]

const taNav = [
  { name: 'Dashboard', icon: Home, href: '/', current: true },
  { name: 'All Doubts', icon: MessageSquare, href: '/doubts', current: false },
  { name: 'Unresolved', icon: AlertCircle, href: '/unresolved', current: false },
  { name: 'Moderation', icon: Shield, href: '/moderation', current: false },
  { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge', current: false },
  { name: 'Help', icon: HelpCircle, href: '/help', current: false },
]

const facultyNav = [
  { name: 'Dashboard', icon: Home, href: '/', current: true },
  { name: 'Escalated Doubts', icon: TrendingUp, href: '/escalated', current: false },
  { name: 'Analytics', icon: BarChart3, href: '/analytics', current: false },
  { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge', current: false },
  { name: 'Help', icon: HelpCircle, href: '/help', current: false },
]

function getNavForRole(role?: UserRole) {
  switch (role) {
    case 'teaching_assistant': return taNav
    case 'faculty': return facultyNav
    case 'student':
    default: return studentNav
  }
}

const roleBadgeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  student: { label: 'Student', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', icon: BookOpen },
  teaching_assistant: { label: 'TA', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: Shield },
  faculty: { label: 'Faculty', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: GraduationCap },
}

interface SidebarProps {
  userRole?: UserRole
  onLogout?: () => void
  user?: User | null
}

export function Sidebar({ userRole, onLogout, user }: SidebarProps) {
  const navigation = getNavForRole(userRole)
  const badge = roleBadgeConfig[userRole || 'student']

  const displayName = user
    ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username)
    : 'Guest'

  const initials = user
    ? (user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : user.username.substring(0, 2).toUpperCase())
    : 'G'

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Doubtify</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    item.current
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border", badge.color)}>
                      <badge.icon className="w-2.5 h-2.5" />
                      {badge.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.reputation?.total || 0} rep</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 w-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-medium">G</span>
              </div>
              <p className="text-sm text-muted-foreground">Not logged in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}