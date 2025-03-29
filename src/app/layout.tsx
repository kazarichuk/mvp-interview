import { AuthProvider } from '@/components/providers/AuthProvider';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import '@/styles/tailwind.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: 'HireFlick',
  description: 'AI-Driven Recruitment Platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <SpeedInsights />
          <Analytics />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}