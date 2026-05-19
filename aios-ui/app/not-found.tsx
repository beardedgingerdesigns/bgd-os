// aios-ui/app/not-found.tsx
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Not found</h1>
        <p className="text-muted-foreground mb-4">
          The client or project you&apos;re looking for isn&apos;t in <code>clients.yaml</code>.
        </p>
        <Link href="/" className={buttonVariants()}>Back home</Link>
      </div>
    </main>
  )
}
