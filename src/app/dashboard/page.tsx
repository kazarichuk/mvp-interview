// src/app/dashboard/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { Header } from "@/components/dashboard/Header"
import { Footer } from "@/components/dashboard/Footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CandidatesTable from "@/components/candidates/CandidatesTable"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/auth/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (!auth.currentUser) return null

  const isGoogleUser = auth.currentUser.providerData[0]?.providerId === 'google.com'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex">
        <div className="w-full max-w-7xl mx-auto p-8">
          {!isGoogleUser && !auth.currentUser.emailVerified && (
            <Alert className="mb-4">
              <AlertDescription>
                Please check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}
          <CandidatesTable />
        </div>
      </main>
      <Footer />
    </div>
  )
}