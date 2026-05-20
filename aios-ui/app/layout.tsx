import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import './globals.css'
import { SSEListener } from '@/components/sse-listener'

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIOS',
  description: 'Justin Lobaito AIOS — local tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${robotoSlab.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <SSEListener />
        {children}
      </body>
    </html>
  )
}
