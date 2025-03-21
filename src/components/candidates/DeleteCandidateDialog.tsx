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
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deactivateInvite } from '@/lib/firebase/invites'
import { doc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/config'
import { Toast } from '@/components/ui/toast'

// Helper function to show toast
function showToast(title: string, description: string, variant: 'default' | 'success' | 'error' = 'default') {
  // Create container for the toast
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  // Create toast element
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div class="group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all ${
      variant === 'success' ? 'bg-green-50 border-green-200' : 
      variant === 'error' ? 'bg-red-50 border-red-200' : 
      'bg-white border-gray-200'
    }">
      <div class="flex flex-col gap-1">
        ${title ? `<div class="font-semibold">${title}</div>` : ''}
        ${description ? `<div class="text-sm opacity-90">${description}</div>` : ''}
      </div>
      <button class="absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `;
  
  // Add to the DOM
  document.body.appendChild(toast);
  
  // Add animation classes
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.maxWidth = '420px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Find the close button and add click event
  const closeButton = toast.querySelector('button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

interface DeleteCandidateDialogProps {
  candidateId: string
  candidateName: string
  inviteId?: string
  onDelete: (id: string) => void
  trigger?: React.ReactNode
}

export const DeleteCandidateDialog: FC<DeleteCandidateDialogProps> = ({
  candidateId,
  candidateName,
  inviteId,
  onDelete,
  trigger
}) => {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!auth.currentUser) {
      setError('Authentication required')
      return
    }
    
    setDeleting(true)
    setError(null)
    
    try {
      console.log('Starting delete process for candidate:', candidateId);
      
      // Step 1: If we have an inviteId, deactivate the invite link
      if (inviteId) {
        console.log('Deactivating invite:', inviteId);
        const result = await deactivateInvite(inviteId, auth.currentUser.uid)
        if (!result.success) {
          throw new Error(result.error || 'Failed to deactivate invite link')
        }
      }
      
      // Step 2: Delete directly from Firestore to ensure it works
      try {
        console.log('Deleting candidate from Firestore:', candidateId);
        const candidateRef = doc(db, 'candidates', candidateId);
        await deleteDoc(candidateRef);
        console.log('Successfully deleted from Firestore');
      } catch (firestoreError) {
        console.error('Error deleting from Firestore:', firestoreError);
        throw new Error('Failed to delete from database');
      }
      
      // Step 3: Trigger the delete action from the parent component
      console.log('Calling parent onDelete function');
      onDelete(candidateId);
      
      // Step 4: Close dialog and show success toast
      setOpen(false)
      
      // Show toast message
      showToast(
        "Candidate deleted", 
        `${candidateName} has been removed from your candidates list.`,
        "success"
      );
      
    } catch (err: any) {
      console.error('Error deleting candidate:', err)
      setError(err.message || 'Failed to delete candidate')
      
      // Show error toast
      showToast(
        "Error deleting candidate", 
        err.message || 'Failed to delete candidate',
        "error"
      );
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirm Candidate Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this candidate? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">Candidate details:</p>
            <p className="text-sm text-muted-foreground">Name: <span className="font-medium text-foreground">{candidateName}</span></p>
            <p className="text-sm text-muted-foreground">ID: <span className="font-medium text-foreground">{candidateId}</span></p>
            {inviteId && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-destructive font-medium">Note:</span> Their interview invitation link will be deactivated.
              </p>
            )}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-4 text-sm text-amber-800">
            Deleted candidates will be removed from your dashboard and their data will no longer be accessible.
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Candidate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteCandidateDialog