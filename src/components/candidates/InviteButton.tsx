// src/components/candidates/InviteButton.tsx
"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Link as LinkIcon, Check } from 'lucide-react'
import { createInvite } from '@/lib/firebase/invites'
import { auth } from '@/lib/firebase/config'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InviteButtonProps {
  position?: string
}

export const InviteButton: React.FC<InviteButtonProps> = ({ position = 'UX/UI Designer' }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateInvite = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to create an invite')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await createInvite(auth.currentUser.uid, position)
      
      if (result.success && result.inviteCode) {
        // Создаем полную ссылку для приглашения
        const baseUrl = window.location.origin
        const fullLink = `${baseUrl}/interview/${result.inviteCode}`
        setInviteLink(fullLink)
      } else {
        setError(result.error || 'Failed to create invite link')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy link: ', err)
          setError('Failed to copy link to clipboard')
        })
    }
  }
  
  const shareViaEmail = () => {
    if (inviteLink) {
      const subject = encodeURIComponent(`Interview Invitation for ${position} Position`);
      const body = encodeURIComponent(
        `Hello,\n\nYou have been invited to participate in an automated interview for the ${position} position.\n\n` +
        `Please click the link below to start the process:\n${inviteLink}\n\n` +
        `This interview will take approximately 15-20 minutes to complete.\n\n` +
        `Best regards,\nHireFlick Recruitment Team`
      );
      
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Сбрасываем состояние через небольшую задержку для анимации закрытия
    setTimeout(() => {
      setInviteLink(null)
      setError(null)
      setCopied(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        Invite Candidates
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Candidates</DialogTitle>
          <DialogDescription>
            Create a link that you can share with candidates for automated interviews.
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input 
                id="position" 
                value={position} 
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Candidates will apply for this position.
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                onClick={handleCreateInvite}
                disabled={loading}
              >
                {loading ? 'Creating link...' : 'Create invite link'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Invite Link</Label>
              <div className="flex items-center">
                <Input
                  id="invite-link"
                  value={inviteLink}
                  readOnly
                  className="pr-10 bg-gray-50"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Share this link with candidates to start automated interviews.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy link'}
                </Button>
                <Button
                  variant="outline"
                  onClick={shareViaEmail}
                  className="flex items-center justify-center"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share via Email
                </Button>
              </div>
              <Button onClick={handleClose} className="sm:ml-auto">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default InviteButton