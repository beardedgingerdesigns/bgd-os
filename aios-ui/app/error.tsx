// aios-ui/app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Something broke</h1>
        <p className="text-muted-foreground mb-4 font-mono text-sm">
          {error.message}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>Back home</Link>
        </div>
      </div>
    </main>
  )
}
