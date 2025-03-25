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
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Upload, 
  FileText, 
  Mail, 
  User, 
  Loader2, 
  X, 
  CheckCircle2
} from 'lucide-react'
import { Candidate } from './CandidatesTable'
import { createInvite, addCandidate, validateInterviewSession } from '@/lib/firebase/invites'
import { auth } from '@/lib/firebase/config'
import { sendInterviewInviteEmail } from '@/lib/email/interview-invite'
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface AddCandidateModalProps {
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void
  position?: string
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ 
  onAddCandidate,
  position = 'UX/UI Designer'
}) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSendStatus, setEmailSendStatus] = useState<'not_sent' | 'sending' | 'sent' | 'failed'>('not_sent')
  const [pythonApiStatus, setPythonApiStatus] = useState<'not_validated' | 'validating' | 'validated' | 'failed'>('not_validated')

  const resetForm = () => {
    setName('')
    setEmail('')
    setFile(null)
    setError(null)
    setEmailSendStatus('not_sent')
    setPythonApiStatus('not_validated')
  }
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing modal
      setTimeout(() => resetForm(), 300)
    }
    setOpen(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailSendStatus('not_sent');
    setPythonApiStatus('not_validated');

    // Set a global timeout for the entire operation
    const globalTimeoutId = setTimeout(() => {
      setLoading(false);
      setError('Operation timed out. Please try again.');
      // Reset form on timeout
      resetForm();
    }, 60000); // Increase timeout to 60 seconds

    try {
      // Check that user is authenticated
      const user = auth.currentUser
      if (!user) {
        clearTimeout(globalTimeoutId)
        throw new Error('You must be logged in to send invites')
      }

      console.log("Creating invitation")
      // Create invitation with maximum validity of 24 hours
      const inviteResult = await createInvite(user.uid, position, 1)
      
      if (!inviteResult.success || !inviteResult.inviteCode) {
        clearTimeout(globalTimeoutId)
        throw new Error('Failed to create invite')
      }

      console.log("Invitation created:", inviteResult)
      // Generate full invitation link
      const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/interview/${inviteResult.inviteCode}`

      // Check if there's an existing interview for this email
      try {
        const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_INTERVIEW_API_URL}/check-email/${email}`);
        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          if (errorData.detail === 'Interview already exists') {
            // Reset any existing interview for this email
            const resetResponse = await fetch(`${process.env.NEXT_PUBLIC_INTERVIEW_API_URL}/reset-email/${email}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (!resetResponse.ok) {
              console.warn('Failed to reset existing interview:', await resetResponse.json());
            }
          }
        }
      } catch (checkError) {
        console.warn('Error checking email status:', checkError);
        // Continue with the process even if check fails
      }

      // Prepare data for adding a candidate
      const candidateData: any = {
        name,
        email,
        inviteLink
      }

      // Add CV only if file exists
      if (file) {
        const cvUrl = URL.createObjectURL(file)
        candidateData.cvUrl = cvUrl
        candidateData.cvFilename = file.name
      }

      console.log("Adding candidate to database")
      // Add candidate to Firebase first
      const candidateResult = await addCandidate(inviteResult.id, candidateData)

      if (!candidateResult.success) {
        clearTimeout(globalTimeoutId)
        throw new Error(candidateResult.error || 'Failed to add candidate')
      }

      console.log("Candidate added successfully:", candidateResult)
      // Create candidate in the table
      const newCandidate: Omit<Candidate, 'id'> = {
        name,
        email,
        cv: file ? {
          url: URL.createObjectURL(file),
          filename: file.name
        } : null,
        status: 'pending',
        level: position
      }

      // Add candidate to UI immediately
      onAddCandidate(newCandidate)

      // Start both operations in parallel with increased timeouts
      const operations = []
      
      // 1. Python API validation with increased timeout
      console.log("Starting Python API validation")
      setPythonApiStatus('validating')
      const pythonPromise = new Promise<void>((resolve, reject) => {
        const pythonTimeoutId = setTimeout(() => {
          console.log("Python API validation timed out")
          setPythonApiStatus('failed')
          resolve() // Resolve instead of reject to continue the process
        }, 10000) // Increase timeout to 10 seconds

        validateInterviewSession(inviteResult.inviteCode, email)
          .then(result => {
            clearTimeout(pythonTimeoutId)
            if (result.success) {
              console.log('Python API validation successful:', result.data)
              setPythonApiStatus('validated')
            } else {
              console.warn('Python API validation failed:', result.error)
              setPythonApiStatus('failed')
            }
            resolve()
          })
          .catch(e => {
            clearTimeout(pythonTimeoutId)
            console.error('Python API validation error:', e)
            setPythonApiStatus('failed')
            resolve() // Resolve instead of reject to continue the process
          })
      })
      operations.push(pythonPromise)

      // 2. Email sending with increased timeout
      console.log("Starting email sending")
      setEmailSendStatus('sending')
      const emailPromise = new Promise<void>((resolve, reject) => {
        const emailTimeoutId = setTimeout(() => {
          console.log("Email sending timed out")
          setEmailSendStatus('failed')
          resolve() // Resolve instead of reject to continue the process
        }, 15000) // Increase timeout to 15 seconds

        sendInterviewInviteEmail({
          to: email,
          name,
          inviteLink,
          position
        })
          .then(result => {
            clearTimeout(emailTimeoutId)
            if (!result.success) {
              console.warn('Email sending failed:', result.error)
              setEmailSendStatus('failed')
            } else {
              console.log('Email sent successfully')
              setEmailSendStatus('sent')
            }
            resolve()
          })
          .catch(err => {
            clearTimeout(emailTimeoutId)
            console.error('Email sending error:', err)
            setEmailSendStatus('failed')
            resolve() // Resolve instead of reject to continue the process
          })
      })
      operations.push(emailPromise)

      // Wait for both operations to complete or timeout
      console.log("Waiting for operations to complete or timeout")
      await Promise.allSettled(operations)
      console.log("All operations completed or timed out")

      // Close modal after short delay to show success message
      console.log("Setting timeout to close modal")
      setTimeout(() => {
        setOpen(false)
        console.log("Modal closed")
      }, 1500)

    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'An unexpected error occurred')
      // Reset form on error
      resetForm();
    } finally {
      clearTimeout(globalTimeoutId)
      setLoading(false)
      console.log("Form submission completed")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center h-10"
          variant="default"
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Send Interview Invitation</DialogTitle>
          <DialogDescription>
            Send an AI-powered assessment invite to evaluate {position} skills
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-2" />

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="border border-red-200">
              <AlertDescription className="flex items-center">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {emailSendStatus === 'sent' && (
            <Alert className="bg-green-50 text-green-800 border border-green-200">
              <AlertDescription className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
                Invitation sent successfully to {email}!
              </AlertDescription>
            </Alert>
          )}

          {emailSendStatus === 'failed' && (
            <Alert variant="destructive" className="border border-red-200">
              <AlertDescription className="flex items-center">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
                Candidate added but email notification failed to send.
              </AlertDescription>
            </Alert>
          )}

          {pythonApiStatus === 'failed' && (
            <Alert className="bg-yellow-50 text-yellow-800 border border-yellow-200">
              <AlertDescription className="flex items-center">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
                Warning: Interview AI system may be unavailable. The invite will still be sent.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center text-sm font-medium">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Candidate Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              disabled={loading}
              className="focus-visible:ring-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-sm font-medium">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@company.com"
              required
              disabled={loading}
              className="focus-visible:ring-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv" className="flex items-center text-sm font-medium">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              Resume/CV (Optional)
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="cv"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cv')?.click()}
                  className="w-full justify-start font-normal text-muted-foreground"
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                  {file ? file.name : 'Choose file...'}
                </Button>
              </div>
              
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={loading}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">Supports PDF, DOC, DOCX (max 5MB)</p>
          </div>

          <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground border">
            <p className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
              The candidate will receive an email with a link to complete an AI-powered assessment for the {position} position.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => handleOpenChange(false)}
              disabled={loading || emailSendStatus === 'sending'}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || emailSendStatus === 'sending'}
              className="relative"
            >
              {loading || emailSendStatus === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {emailSendStatus === 'sending' ? 'Sending...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// This component is used for the Info icon
const Info = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

export default AddCandidateModal