'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { DoubtCard } from '@/components/doubt-card'
import { ProfileCard } from '@/components/profile-card'
import { AskDoubtModal } from '@/components/ask-doubt-modal'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Search, LogIn } from 'lucide-react'
import { authService } from '@/lib/api/auth'
import { doubtService } from '@/lib/api/doubts'
import { User, Doubt } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const [askDoubtOpen, setAskDoubtOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [sortBy, setSortBy] = useState('recent')
  const [user, setUser] = useState<User | null>(null)
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userProfile = await authService.getProfile()
          setUser(userProfile)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        authService.logout()
      }
    }

    checkAuth()
  }, [])

  // Load doubts
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
        toast({
          title: 'Error',
          description: 'Failed to load doubts. Using sample data.',
          variant: 'destructive'
        })
        // Use sample data as fallback
        setDoubts(sampleDoubts)
      } finally {
        setIsLoading(false)
      }
    }

    loadDoubts()
  }, [sortBy, toast])

  const handleAuthSuccess = () => {
    // Refresh user profile after successful auth
    authService.getProfile().then(setUser).catch(console.error)
    setAuthModalOpen(false)
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.'
    })
  }

  // Sample doubt data (fallback for when API is not connected)
  const sampleDoubts: Doubt[] = [
    {
      id: 1,
      title: 'How to solve differential equations using integration by parts?',
      description: 'I\'m stuck on solving ∫x*e^x dx using integration by parts. Can someone explain the step-by-step process?',
      authorId: 3,
      subjectId: 1,
      status: 'resolved' as const,
      acceptedResponseId: 1,
      viewsCount: 456,
      isFeatured: false,
      tags: ['calculus', 'integration', 'differential-equations'],
      createdAt: '2 hours ago',
      updatedAt: '2 hours ago',
      authorUsername: 'rahul_sharma',
      authorName: 'Rahul Sharma',
      subjectName: 'Mathematics',
      responsesCount: 8,
      upvotesCount: 124,
      downvotesCount: 0
    },
    {
      id: 2,
      title: 'Quantum entanglement - can someone explain like I\'m 5?',
      description: 'I\'ve been reading about quantum entanglement but the explanations are too complex. Looking for a simpler explanation.',
      authorId: 4,
      subjectId: 2,
      status: 'answered' as const,
      acceptedResponseId: undefined,
      viewsCount: 234,
      isFeatured: false,
      tags: ['quantum-physics', 'entanglement', 'beginner'],
      createdAt: '4 hours ago',
      updatedAt: '4 hours ago',
      authorUsername: 'priya_singh',
      authorName: 'Priya Singh',
      subjectName: 'Physics',
      responsesCount: 5,
      upvotesCount: 89,
      downvotesCount: 0
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground">Browse recent doubts from your community</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Doubts Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-1">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search doubts..."
                      className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  {/* Filter */}
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

                {/* Ask Button or Login Button */}
                {user ? (
                  <Button
                    onClick={() => setAskDoubtOpen(true)}
                    className="ml-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10"
                  >
                    <Plus className="w-4 h-4" />
                    Ask Doubt
                  </Button>
                ) : (
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    variant="outline"
                    className="ml-3 gap-2 h-10"
                  >
                    <LogIn className="w-4 h-4" />
                    Login to Ask
                  </Button>
                )}
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
                      subject={doubt.subjectName || 'Unknown'}
                      author={doubt.authorName || doubt.authorUsername || 'Anonymous'}
                      avatar={doubt.authorUsername?.substring(0, 2).toUpperCase() || 'AN'}
                      upvotes={doubt.upvotesCount || 0}
                      answers={doubt.responsesCount || 0}
                      views={doubt.viewsCount}
                      timeAgo={doubt.createdAt}
                      isResolved={doubt.status === 'resolved'}
                      hasAnswered={doubt.status === 'answered'}
                    />
                  ))
                )}
              </div>

              {/* Load More */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-card hover:text-foreground text-muted-foreground"
                >
                  Load More Doubts
                </Button>
              </div>
            </div>

            {/* Right Column - Profile & Stats */}
            <div className="space-y-6">
              {user ? (
                <ProfileCard
                  username={user.username}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  email={user.email}
                  reputation={user.reputation?.total || 0}
                  level="Gold"
                  streakDays={user.reputation?.streakDays || 0}
                  answeredCount={user.reputation?.responsesGiven || 0}
                />
              ) : (
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-semibold text-foreground mb-3">Welcome to Doubtify!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our community to ask questions, share knowledge, and learn together.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        setAuthMode('register')
                        setAuthModalOpen(true)
                      }}
                      className="w-full"
                    >
                      Sign Up
                    </Button>
                    <Button 
                      onClick={() => {
                        setAuthMode('login')
                        setAuthModalOpen(true)
                      }}
                      variant="outline" 
                      className="w-full"
                    >
                      Login
                    </Button>
                  </div>
                </div>
              )}

              {/* Tips Card */}
              <div className="bg-card border border-primary/20 rounded-lg p-5 bg-linear-to-br from-primary/5 to-transparent">
                <h3 className="font-semibold text-foreground mb-2 text-sm">💡 Pro Tips</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Be specific with your questions</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Search before asking</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Help others to earn reputation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ask Doubt Modal */}
      <AskDoubtModal open={askDoubtOpen} onOpenChange={setAskDoubtOpen} />
      
      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
