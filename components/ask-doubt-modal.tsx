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

interface AskDoubtModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Programming',
  'English',
  'Languages',
  'History',
  'Geography',
  'Economics',
  'Other'
]

export function AskDoubtModal({ open, onOpenChange }: AskDoubtModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !subject) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Submit doubt to backend
      console.log({ title, description, subject })
      
      // Reset form
      setTitle('')
      setDescription('')
      setSubject('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to submit doubt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask a Doubt</DialogTitle>
          <DialogDescription>
            Describe your question clearly and provide context to help others give you the best answer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Title *
            </label>
            <Input
              id="title"
              placeholder="What's your question? Be specific."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-foreground">
              Subject *
            </label>
            <Select value={subject} onValueChange={setSubject} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Provide more details about your question. What have you tried? What specific part are you stuck on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !description.trim() || !subject || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Doubt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}