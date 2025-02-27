// src/app/interview/[code]/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInviteByCode, addCandidate } from '@/lib/firebase/invites'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from 'next/image'

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.code as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invite, setInvite] = useState<any>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    async function validateInvite() {
      if (!inviteCode) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      try {
        const result = await getInviteByCode(inviteCode)
        
        if (!result.success) {
          setError(result.error || 'This invitation link is invalid or has expired')
        } else {
          setInvite(result.invite)
        }
      } catch (err: any) {
        console.error('Error validating invite:', err)
        setError('Error loading invitation. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    validateInvite()
  }, [inviteCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Здесь будет загрузка CV файла в Cloudinary или Firebase Storage
      // В MVP версии мы можем просто сохранить информацию без файла
      
      const cvData = cvFile 
        ? { 
            cvUrl: 'https://example.com/temp-link', // Это заглушка
            cvFilename: cvFile.name 
          } 
        : {}

      const result = await addCandidate(invite.id, {
        name: formData.name,
        email: formData.email,
        ...cvData
      })

      if (result.success) {
        // Перенаправляем на страницу с интервью
        router.push(`/interview/${inviteCode}/start?candidate=${result.candidateId}`)
      } else {
        setError(result.error || 'Failed to submit your information')
      }
    } catch (err: any) {
      console.error('Error submitting candidate info:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading interview information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
            <CardDescription>
              We encountered a problem with this invitation link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="mb-6">
        <Image
          src="/logo.svg"
          alt="HireFlick Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Interview Application</CardTitle>
          <CardDescription>
            Complete this form to apply for the position: <strong>{invite.position}</strong>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Smith"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john.smith@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cv">Resume/CV (Optional)</Label>
              <Input
                id="cv"
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Start Interview'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-6 text-sm text-gray-500">
        Powered by HireFlick • AI-Driven Recruitment Platform
      </p>
    </div>
  )
}