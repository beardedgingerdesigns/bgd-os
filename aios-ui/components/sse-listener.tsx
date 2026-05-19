'use client'

import { useSSE } from '@/hooks/use-sse'

export function SSEListener() {
  useSSE()
  return null
}
