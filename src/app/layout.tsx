// src/app/layout.tsx (удалите "use client")
import { Inter } from 'next/font/google'
import { ClientLayout } from '@/components/ClientLayout'
import '@/styles/tailwind.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}