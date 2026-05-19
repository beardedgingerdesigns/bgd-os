// aios-ui/tests/lib/paths.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('paths', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('uses CLAUDE_OS_ROOT env var when set', async () => {
    process.env.CLAUDE_OS_ROOT = '/tmp/test-claude-os'
    // re-import so the constants are re-evaluated
    const mod = await import('@/lib/paths?reload=' + Date.now())
    expect(mod.CLAUDE_OS_ROOT).toBe('/tmp/test-claude-os')
  })

  it('exposes the canonical sub-paths', async () => {
    process.env.CLAUDE_OS_ROOT = '/tmp/test-claude-os'
    const mod = await import('@/lib/paths?reload=' + Date.now())
    expect(mod.CLIENTS_YAML_PATH).toBe('/tmp/test-claude-os/clients.yaml')
    expect(mod.DECISIONS_LOG_PATH).toBe('/tmp/test-claude-os/decisions/log.md')
    expect(mod.REFERENCES_DIR).toBe('/tmp/test-claude-os/references')
  })
})
