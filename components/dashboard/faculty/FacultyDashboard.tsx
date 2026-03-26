'use client'

import React, { useState, useEffect } from 'react'
import { DoubtCard } from '@/components/doubt-card'
import { ProfileCard } from '@/components/profile-card'
import { Button } from '@/components/ui/button'
import { Search, GraduationCap, CheckCircle2, BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react'
import { doubtService } from '@/lib/api/doubts'
import { User, Doubt } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface FacultyDashboardProps {
  user: User
}

type FacultyTab = 'escalated' | 'analytics'

export function FacultyDashboard({ user }: FacultyDashboardProps) {
  const [activeTab, setActiveTab] = useState<FacultyTab>('escalated')
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Escalated = unanswered for a while or open with many views
  const escalatedDoubts = doubts.filter(d =>
    (d.status === 'open' || (!d.isResolved && !d.hasAnswered)) && (d.views || d.viewCount || 0) > 10
  )

  const resolvedCount = doubts.filter(d => d.isResolved || d.status === 'resolved').length
  const openCount = doubts.filter(d => d.status === 'open' || (!d.isResolved && !d.hasAnswered)).length
  const resolutionRate = doubts.length > 0 ? Math.round((resolvedCount / doubts.length) * 100) : 0

  const tabs: { id: FacultyTab; label: string; icon: React.ElementType }[] = [
    { id: 'escalated', label: 'Escalated Doubts', icon: TrendingUp },
    { id: 'analytics', label: 'System Overview', icon: BarChart3 },
  ]

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-foreground">Faculty Dashboard</h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <GraduationCap className="w-3 h-3" />
            Faculty
          </span>
        </div>
        <p className="text-muted-foreground">
          Review escalated doubts, verify answers, and monitor platform activity
        </p>
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
              </button>
            ))}
          </div>

          {activeTab === 'analytics' ? (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{doubts.length}</div>
                  <div className="text-xs text-muted-foreground">Total Doubts</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{resolvedCount}</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-400">{resolutionRate}%</div>
                  <div className="text-xs text-muted-foreground">Resolution Rate</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{openCount}</div>
                  <div className="text-xs text-muted-foreground">Open Doubts</div>
                </div>
              </div>

              {/* Resolution Rate Bar */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Resolution Overview</h3>
                <div className="w-full bg-background rounded-full h-4 mb-2 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{resolvedCount} resolved</span>
                  <span>{openCount} open</span>
                </div>
              </div>

              {/* Activity placeholder */}
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Detailed charts and analytics for doubts trends, response times, and user engagement will appear here as the platform grows.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Escalated Doubts */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading escalated doubts...</div>
                  </div>
                ) : escalatedDoubts.length === 0 ? (
                  <div className="bg-card border border-green-500/20 rounded-lg p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                    <p className="text-sm text-muted-foreground">No escalated doubts requiring attention right now.</p>
                  </div>
                ) : (
                  escalatedDoubts.map((doubt) => (
                    <div key={doubt.id} className="relative">
                      <div className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <DoubtCard
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
                    </div>
                  ))
                )}
              </div>
            </>
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

          {/* Faculty Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                View Escalated ({escalatedDoubts.length})
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Verify Answers
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* Subjects Info */}
          {user.subjectsHandled && user.subjectsHandled.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">📚 Your Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {user.subjectsHandled.map((subject, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
