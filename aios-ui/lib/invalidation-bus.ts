import type { InvalidationMessage } from '@/lib/types'

type Listener = (msg: InvalidationMessage) => void

class InvalidationBus {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  publish(msg: InvalidationMessage): void {
    for (const l of this.listeners) {
      try {
        l(msg)
      } catch (err) {
        console.error('[invalidation-bus] listener error', err)
      }
    }
  }
}

// Global singleton across Next.js hot reloads.
declare global {
  // eslint-disable-next-line no-var
  var __aiosInvalidationBus: InvalidationBus | undefined
}

export const invalidationBus =
  globalThis.__aiosInvalidationBus ?? (globalThis.__aiosInvalidationBus = new InvalidationBus())
