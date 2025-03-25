// src/components/ClientLayout.tsx
"use client"

import { useEffect } from 'react'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { initPostHog } from '@/lib/analytics/posthog'

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initPostHog()
  }, [])

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}