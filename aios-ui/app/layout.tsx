import type { Metadata } from 'next'
import './globals.css'
import { SSEListener } from '@/components/sse-listener'

export const metadata: Metadata = {
  title: 'AIOS',
  description: 'Justin Lobaito AIOS — local tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SSEListener />
        {children}
      </body>
    </html>
  )
}
