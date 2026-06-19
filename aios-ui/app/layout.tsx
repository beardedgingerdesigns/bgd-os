import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { SSEListener } from '@/components/sse-listener'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIOS',
  description: 'Justin Lobaito AIOS — Operator Console',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className="h-screen overflow-hidden bg-background text-foreground antialiased font-sans">
        <SSEListener />
        {children}
      </body>
    </html>
  )
}
