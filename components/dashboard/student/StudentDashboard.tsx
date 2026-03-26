'use client'

import React, { useState, useEffect } from 'react'
import { DoubtCard } from '@/components/doubt-card'
import { ProfileCard } from '@/components/profile-card'
import { AskDoubtModal } from '@/components/ask-doubt-modal'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { doubtService } from '@/lib/api/doubts'
import { User, Doubt } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface StudentDashboardProps {
  user: User
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [askDoubtOpen, setAskDoubtOpen] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadDoubts = async () => {
      try {
        setIsLoading(true)
        const response = await doubtService.getDoubts({
          page: 1,
          limit: 20,
          sortBy: sortBy === 'recent' ? 'newest' : 'popular'
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
  }, [sortBy, toast])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back! 👋</h1>
        <p className="text-muted-foreground">Browse recent doubts from your community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search doubts..."
                  className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="trending">Trending</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
            <Button
              onClick={() => setAskDoubtOpen(true)}
              className="ml-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10"
            >
              <Plus className="w-4 h-4" />
              Ask Doubt
            </Button>
          </div>

          {/* Doubts List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading doubts...</div>
              </div>
            ) : (
              doubts.map((doubt) => (
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

          <div className="pt-4">
            <Button variant="outline" className="w-full border-border hover:bg-card hover:text-foreground text-muted-foreground">
              Load More Doubts
            </Button>
          </div>
        </div>

        {/* Right Column */}
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

          <div className="bg-card border border-primary/20 rounded-lg p-5 bg-linear-to-br from-primary/5 to-transparent">
            <h3 className="font-semibold text-foreground mb-2 text-sm">💡 Pro Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span>✓</span><span>Be specific with your questions</span></li>
              <li className="flex gap-2"><span>✓</span><span>Search before asking</span></li>
              <li className="flex gap-2"><span>✓</span><span>Help others to earn reputation</span></li>
            </ul>
          </div>
        </div>
      </div>

      <AskDoubtModal open={askDoubtOpen} onOpenChange={setAskDoubtOpen} />
    </>
  )
}
