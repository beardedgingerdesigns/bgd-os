import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import {
  readChatSession,
  writeChatSession,
  deleteChatSession,
  sessionsFilePath,
} from '@/lib/cache/sessions'

describe('chat sessions cache', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-sessions-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('returns null when no session exists for the given client/project', async () => {
    expect(await readChatSession('inside-out', 'inside-out-website')).toBeNull()
  })

  it('round-trips a session entry', async () => {
    const session = {
      clientSlug: 'inside-out',
      projectSlug: 'inside-out-website',
      sessionId: 'sess_abc123',
      startedAt: '2026-05-19T14:00:00Z',
    }
    await writeChatSession(session)
    const got = await readChatSession('inside-out', 'inside-out-website')
    expect(got).toEqual(session)
  })

  it('isolates sessions per client/project pair', async () => {
    await writeChatSession({
      clientSlug: 'inside-out', projectSlug: 'inside-out-website',
      sessionId: 'sess_a', startedAt: '2026-05-19T14:00:00Z',
    })
    await writeChatSession({
      clientSlug: 'iowaeverywhere', projectSlug: 'iowaeverywhere-v2',
      sessionId: 'sess_b', startedAt: '2026-05-19T14:01:00Z',
    })
    const a = await readChatSession('inside-out', 'inside-out-website')
    const b = await readChatSession('iowaeverywhere', 'iowaeverywhere-v2')
    expect(a?.sessionId).toBe('sess_a')
    expect(b?.sessionId).toBe('sess_b')
  })

  it('deleteChatSession removes a session', async () => {
    await writeChatSession({
      clientSlug: 'inside-out', projectSlug: 'inside-out-website',
      sessionId: 'sess_a', startedAt: '2026-05-19T14:00:00Z',
    })
    await deleteChatSession('inside-out', 'inside-out-website')
    expect(await readChatSession('inside-out', 'inside-out-website')).toBeNull()
  })

  it('sessionsFilePath honors AIOS_CACHE_DIR', () => {
    expect(sessionsFilePath()).toBe(path.join(tmpDir, 'sessions.json'))
  })
})
