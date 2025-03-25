"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/dashboard/Header"
import { Footer } from "@/components/dashboard/Footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CandidatesTable from "@/components/candidates/CandidatesTable"
import { useAuth } from '@/components/providers/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Показываем загрузку во время проверки аутентификации
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  // Перенаправляем на логин, если пользователь не аутентифицирован
  if (!user) {
    router.replace('/auth/login')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  const isGoogleUser = user.providerData[0]?.providerId === 'google.com'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex">
        <div className="w-full max-w-7xl mx-auto p-8">
          {!isGoogleUser && !user.emailVerified && (
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