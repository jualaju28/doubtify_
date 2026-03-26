'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { authService } from '@/lib/services/auth'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, mode, onModeChange, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
    role: 'student' as UserRole,
    department: '',
    year: '',
    designation: '',
    subjectExpertise: '',
    subjectsHandled: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await authService.login({
          email: formData.email,
          password: formData.password
        })
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.'
        })
      } else {
        const registerPayload: Record<string, unknown> = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio || undefined,
          role: formData.role,
          department: formData.department || undefined,
        }

        if (formData.role === 'student') {
          registerPayload.year = formData.year || undefined
        }
        if (formData.role === 'teaching_assistant') {
          registerPayload.subjectExpertise = formData.subjectExpertise || undefined
        }
        if (formData.role === 'faculty') {
          registerPayload.designation = formData.designation || undefined
          registerPayload.subjectsHandled = formData.subjectsHandled
            ? formData.subjectsHandled.split(',').map(s => s.trim()).filter(Boolean)
            : undefined
        }

        await authService.register(registerPayload as Parameters<typeof authService.register>[0])
        toast({
          title: 'Welcome to Doubtify!',
          description: 'Your account has been created successfully.'
        })
      }

      // Reset form
      setFormData({
        username: '', email: '', password: '', firstName: '', lastName: '', bio: '',
        role: 'student', department: '', year: '', designation: '', subjectExpertise: '', subjectsHandled: '',
      })

      onOpenChange(false)
      onSuccess?.()

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    teaching_assistant: 'Teaching Assistant',
    faculty: 'Faculty',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Welcome Back' : 'Join Doubtify'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Sign in to your account to continue.'
              : 'Create an account to start asking and answering doubts.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Role Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  I am a *
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleLabels) as UserRole[]).map(r => (
                      <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username *
                </label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Conditional fields based on role */}
          {mode === 'register' && (
            <>
              {/* Department — all roles */}
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium text-foreground">
                  Department
                </label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>

              {/* Student-only: Year */}
              {formData.role === 'student' && (
                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-medium text-foreground">
                    Year
                  </label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                      <SelectItem value="5th">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* TA-only: Subject Expertise */}
              {formData.role === 'teaching_assistant' && (
                <div className="space-y-2">
                  <label htmlFor="subjectExpertise" className="text-sm font-medium text-foreground">
                    Subject Expertise *
                  </label>
                  <Input
                    id="subjectExpertise"
                    name="subjectExpertise"
                    placeholder="e.g. Data Structures, Algorithms"
                    value={formData.subjectExpertise}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {/* Faculty-only: Designation & Subjects Handled */}
              {formData.role === 'faculty' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="designation" className="text-sm font-medium text-foreground">
                      Designation *
                    </label>
                    <Input
                      id="designation"
                      name="designation"
                      placeholder="e.g. Associate Professor"
                      value={formData.designation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subjectsHandled" className="text-sm font-medium text-foreground">
                      Subjects Handled
                    </label>
                    <Input
                      id="subjectsHandled"
                      name="subjectsHandled"
                      placeholder="Comma-separated: OS, DBMS, Networks"
                      value={formData.subjectsHandled}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Bio (optional)
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading
              ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </Button>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('register')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}