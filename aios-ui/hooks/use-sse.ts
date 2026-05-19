'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useSSE() {
  const router = useRouter()
  const ref = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource('/api/sse')
    ref.current = es

    es.addEventListener('invalidate', () => {
      router.refresh()
    })

    es.onerror = () => {
      // Auto-reconnect handled by the browser; nothing to do here.
    }

    return () => {
      es.close()
      ref.current = null
    }
  }, [router])
}
