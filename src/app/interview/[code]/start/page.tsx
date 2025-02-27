// src/app/interview/[code]/start/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from 'next/image'
import { updateCandidateStatus } from '@/lib/firebase/invites'

export default function InterviewStartPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const inviteCode = params.code as string
  const candidateId = searchParams.get('candidate')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  // В реальном приложении здесь будет логика загрузки данных о кандидате
  // и интервью, но для MVP делаем упрощенную версию

  const handleStartInterview = async () => {
    setLoading(true)
    setError(null)

    try {
      // В будущем здесь будет начало настоящего интервью
      // Для MVP просто меняем статус на "в процессе"
      await updateCandidateStatus(candidateId!, 'pending')
      setStarted(true)
    } catch (err: any) {
      console.error('Error starting interview:', err)
      setError(err.message || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteInterview = async () => {
    setLoading(true)
    setError(null)

    try {
      // В будущем здесь будет логика завершения интервью и сохранения результатов
      // Для MVP просто меняем статус на "завершено"
      await updateCandidateStatus(candidateId!, 'completed')
      // Перенаправление на страницу завершения
      window.location.href = `/interview/${inviteCode}/complete`
    } catch (err: any) {
      console.error('Error completing interview:', err)
      setError(err.message || 'Failed to complete the interview')
    } finally {
      setLoading(false)
    }
  }

  if (!candidateId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Request</CardTitle>
            <CardDescription>
              Missing candidate information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                The interview link is incomplete. Please use the exact link you received.
              </AlertDescription>
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
      
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{started ? "AI Interview in Progress" : "Start Your Interview"}</CardTitle>
          <CardDescription>
            {started 
              ? "Please complete all questions for a thorough assessment"
              : "This automated interview will evaluate your skills and experience"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!started ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Interview Information</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>This interview will take approximately 15-20 minutes</li>
                  <li>You will be asked a series of questions about your experience and skills</li>
                  <li>Your responses will be analyzed by our AI system</li>
                  <li>Ensure you have a stable internet connection</li>
                  <li>Find a quiet place without distractions</li>
                </ul>
              </div>
              
              <p className="text-gray-600">
                When you're ready, click the button below to begin the interview process.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Здесь будет содержимое интервью */}
              {/* Для MVP используем заглушку */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Question 1 of 5:</h3>
                <p className="mb-4">Tell us about your experience with design systems and component libraries.</p>
                <textarea 
                  className="w-full border rounded-md p-3 min-h-32"
                  placeholder="Type your answer here..."
                ></textarea>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Question 2 of 5:</h3>
                <p className="mb-4">Describe a challenging UX problem you solved and your approach.</p>
                <textarea 
                  className="w-full border rounded-md p-3 min-h-32"
                  placeholder="Type your answer here..."
                ></textarea>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {!started ? (
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={handleStartInterview}
              disabled={loading}
            >
              {loading ? "Preparing Interview..." : "Start Interview Now"}
            </Button>
          ) : (
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={handleCompleteInterview}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Complete Interview"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <p className="mt-6 text-sm text-gray-500">
        Powered by HireFlick • AI-Driven Recruitment Platform
      </p>
    </div>
  )
}