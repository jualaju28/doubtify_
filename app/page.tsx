'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import { authService } from '@/lib/api/auth'
import { User } from '@/types'
import { useToast } from '@/hooks/use-toast'

import { StudentDashboard } from '@/components/dashboard/student/StudentDashboard'
import { TADashboard } from '@/components/dashboard/ta/TADashboard'
import { FacultyDashboard } from '@/components/dashboard/faculty/FacultyDashboard'

export default function Dashboard() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<User | null>(null)
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

  // Render role-specific dashboard
  const renderDashboard = () => {
    if (!user) {
      // Unauthenticated: show public landing
      return (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to Doubtify! 👋</h1>
            <p className="text-muted-foreground">Your go-to platform for solving college doubts</p>
          </div>

          <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="font-semibold text-foreground mb-3 text-lg">Get Started</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Join our community to ask questions, share knowledge, and learn together.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => { setAuthMode('register'); setAuthModalOpen(true) }}
                className="w-full"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => { setAuthMode('login'); setAuthModalOpen(true) }}
                variant="outline"
                className="w-full"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      )
    }

    switch (user.role) {
      case 'teaching_assistant':
        return (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <TADashboard user={user} />
          </div>
        )
      case 'faculty':
        return (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <FacultyDashboard user={user} />
          </div>
        )
      case 'student':
      default:
        return (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <StudentDashboard user={user} />
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={user?.role} onLogout={handleLogout} user={user} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderDashboard()}
      </main>

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
