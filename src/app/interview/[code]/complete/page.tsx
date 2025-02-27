// src/app/interview/[code]/complete/page.tsx
"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export default function InterviewCompletePage() {
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
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Interview Completed</CardTitle>
          <CardDescription>
            Thank you for completing your interview
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Your responses have been successfully recorded. Our team will review your interview results.
            </p>
            <p className="text-gray-600">
              If your profile matches our requirements, we'll contact you for the next steps in the interview process.
            </p>
            <div className="bg-blue-50 p-4 rounded-md mt-6">
              <p className="text-sm text-blue-700">
                The hiring team has been notified of your completed interview.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-6 text-sm text-gray-500">
        Powered by HireFlick • AI-Driven Recruitment Platform
      </p>
    </div>
  )
}