'use client'

import React, { useState, useEffect } from 'react'
import { DoubtCard } from '@/components/doubt-card'
import { ProfileCard } from '@/components/profile-card'
import { Button } from '@/components/ui/button'
import { Search, AlertCircle, Shield, Tag, Filter } from 'lucide-react'
import { doubtService } from '@/lib/api/doubts'
import { User, Doubt } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface TADashboardProps {
  user: User
}

type TATab = 'all' | 'unresolved' | 'moderation'

export function TADashboard({ user }: TADashboardProps) {
  const [activeTab, setActiveTab] = useState<TATab>('all')
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tagFilter, setTagFilter] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const loadDoubts = async () => {
      try {
        setIsLoading(true)
        const response = await doubtService.getDoubts({
          page: 1,
          limit: 30,
          sortBy: 'newest'
        })
        setDoubts(response.doubts)
      } catch (error) {
        console.error('Failed to load doubts:', error)
        toast({ title: 'Error', description: 'Failed to load doubts.', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    loadDoubts()
  }, [toast])

  // Filter doubts based on active tab
  const filteredDoubts = doubts.filter(doubt => {
    if (activeTab === 'unresolved') {
      return doubt.status === 'open' || (!doubt.isResolved && !doubt.hasAnswered)
    }
    return true
  }).filter(doubt => {
    if (!tagFilter) return true
    return doubt.tags?.some(t => t.toLowerCase().includes(tagFilter.toLowerCase()))
  })

  const unresolvedCount = doubts.filter(d => d.status === 'open' || (!d.isResolved && !d.hasAnswered)).length

  const tabs: { id: TATab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'all', label: 'All Doubts', icon: Search },
    { id: 'unresolved', label: 'Unresolved', icon: AlertCircle, count: unresolvedCount },
    { id: 'moderation', label: 'Moderation', icon: Shield },
  ]

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-foreground">TA Dashboard</h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/25">
            <Shield className="w-3 h-3" />
            TA
          </span>
        </div>
        <p className="text-muted-foreground">Manage, moderate, and resolve student doubts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive/15 text-destructive'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTagFilter('')}>
              <Filter className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'moderation' ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Moderation Panel</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Review reported answers, flag spam, and mark helpful responses. Moderation actions will appear here when reports are available.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-500">0</div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-red-500">0</div>
                  <div className="text-xs text-muted-foreground">Flagged</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading doubts...</div>
                </div>
              ) : filteredDoubts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No doubts match your filter.</div>
              ) : (
                filteredDoubts.map((doubt) => (
                  <DoubtCard
                    key={doubt.id}
                    id={doubt.id.toString()}
                    title={doubt.title}
                    description={doubt.description}
                    subject={doubt.subject || 'Unknown'}
                    author={doubt.author || 'Anonymous'}
                    avatar={doubt.avatar || 'AN'}
                    upvotes={doubt.upvotes || 0}
                    answers={doubt.answers || 0}
                    views={doubt.views || doubt.viewCount || 0}
                    timeAgo={doubt.timeAgo || doubt.createdAt}
                    isResolved={doubt.isResolved || doubt.status === 'resolved'}
                    hasAnswered={doubt.hasAnswered || doubt.status === 'answered' as string}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <ProfileCard
            username={user.username}
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            reputation={user.reputation?.total || 0}
            level="Gold"
            streakDays={user.reputation?.streakDays || 0}
            answeredCount={user.reputation?.responsesGiven || 0}
            role={user.role}
          />

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">📊 TA Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Doubts</span>
                <span className="text-sm font-bold text-foreground">{doubts.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <span className="text-sm text-red-400">Unresolved</span>
                <span className="text-sm font-bold text-red-400">{unresolvedCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                <span className="text-sm text-green-400">Resolved</span>
                <span className="text-sm font-bold text-green-400">{doubts.length - unresolvedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
