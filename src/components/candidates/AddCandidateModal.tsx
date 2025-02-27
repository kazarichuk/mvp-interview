// src/components/candidates/AddCandidateModal.tsx
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
import { Plus, Upload } from 'lucide-react'
import { Candidate } from './CandidatesTable'

interface AddCandidateModalProps {
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onAddCandidate }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Создаем нового кандидата
    const newCandidate: Omit<Candidate, 'id'> = {
      name,
      email,
      cv: file ? {
        url: URL.createObjectURL(file), // Временный URL для разработки
        filename: file.name
      } : null,
      status: 'pending'
    }
    
    onAddCandidate(newCandidate)
    
    // Сбрасываем форму и закрываем модальное окно
    setName('')
    setEmail('')
    setFile(null)
    setOpen(false)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="flex items-center bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter candidate details to add them to your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Smith" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="john.smith@company.com" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cv">CV (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="cv" 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange} 
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('cv')?.click()}
                className="w-full justify-start"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Upload CV'}
              </Button>
              {file && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFile(null)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Candidate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCandidateModal