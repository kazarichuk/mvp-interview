"use client"

import { FC, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Mail, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth } from '@/lib/firebase/config'

interface AccountDeletionDialogProps {
  className?: string
}

const DELETION_REASONS = [
  { id: 'not-useful', label: 'Service is not useful for me' },
  { id: 'too-expensive', label: 'Service is too expensive' },
  { id: 'found-alternative', label: 'Found a better alternative' },
  { id: 'temporary', label: 'Temporary - will create a new account later' },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'other', label: 'Other reason' },
]

export const AccountDeletionDialog: FC<AccountDeletionDialogProps> = ({ className }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      setError('Please select a reason for account deletion')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const userEmail = auth.currentUser?.email || 'Unknown email'
      const userName = auth.currentUser?.displayName || userEmail.split('@')[0] || 'User'
      
      // Construct email content
      const subject = encodeURIComponent(`Account Deletion Request - ${userName}`)
      const body = encodeURIComponent(
        `Hello,\n\n` +
        `I'd like to request my account deletion.\n\n` +
        `Email: ${userEmail}\n` +
        `Reason: ${DELETION_REASONS.find(r => r.id === reason)?.label || reason}\n` +
        `Additional Information: ${additionalInfo}\n\n` +
        `Please process my account deletion request.\n\n` +
        `Thank you.`
      )
      
      // Open email client
      window.location.href = `mailto:kazarichuk@gmail.com?subject=${subject}&body=${body}`
      
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        // Reset form after dialog closes
        setTimeout(() => {
          setSuccess(false)
          setReason('')
          setAdditionalInfo('')
        }, 300)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to send deletion request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className={className}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Request Account Deletion</DialogTitle>
          <DialogDescription>
            Please help us understand why you're leaving. Your feedback is important to us.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Request Sent Successfully</AlertTitle>
              <AlertDescription>
                Your account deletion request has been submitted. We'll process your request shortly.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for leaving <span className="text-destructive">*</span></Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger id="reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {DELETION_REASONS.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional information (optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Please share any additional feedback that would help us improve"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-sm">
              <p className="font-medium text-amber-800 mb-1">Important:</p>
              <p className="text-amber-700">
                Deleting your account will remove all your data and cannot be undone. 
                Your request will be reviewed and processed by our team.
              </p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Deletion Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AccountDeletionDialog