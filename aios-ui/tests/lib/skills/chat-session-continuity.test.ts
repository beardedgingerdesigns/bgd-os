/**
 * HUB-03 session-continuity contract test.
 *
 * Asserts that:
 * 1. runChatLoad on a fresh project spawns claude WITHOUT --resume and produces
 *    a sessionId from the subprocess output.
 * 2. runChatMessage uses the sessionId written to sessions.json via --resume.
 * 3. These contracts hold after the Task 3 bootstrap rewrite — the seed prompt
 *    assembled by assembleSeedPrompt passes through runChatLoad unchanged in
 *    terms of the --resume arg path.
 *
 * Approach: fake-claudeBin injection via opts.claudeBin (both runChatLoad and
 * runChatMessage accept this option). The fake binary logs its argv to a
 * side-channel file (argv_log.txt) inside a per-test tmpdir so we can assert
 * exactly which args were passed. Same bash-fake-claudeBin pattern as 04-06
 * build-brief tests, extended to emit --resume-aware session ids.
 *
 * We use fake-claude-chat.sh which already handles both modes:
 *   - no --resume: emits a brief + session_id 'sess_loaded_xyz', exit 0
 *   - --resume <id>: emits a reply using the same session id, exit 0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { execSync } from 'child_process'

import { runChatLoad, runChatMessage } from '@/lib/skills/chat'
import { assembleSeedPrompt } from '@/lib/skills/chat-bootstrap'

// fake-claude-chat.sh is the canonical fixture for session-aware chat tests.
const FAKE_CHAT = path.resolve(__dirname, '../../fixtures/fake-claude-chat.sh')

// We need a wrapper binary that ALSO logs argv to a file so we can assert on
// which args were passed. Build it once per test (written to tmpdir).
async function createArgvLoggingWrapper(
  tmpDir: string,
  realBin: string,
): Promise<string> {
  const wrapperPath = path.join(tmpDir, 'claude-spy.sh')
  const logPath = path.join(tmpDir, 'argv_log.txt')
  // Bash wrapper: log all $@ to file, then exec the real fake binary.
  const script = [
    '#!/usr/bin/env bash',
    `printf '%s\\n' "$@" >> "${logPath}"`,
    `exec "${realBin}" "$@"`,
  ].join('\n')
  await fs.writeFile(wrapperPath, script, { mode: 0o755 })
  return wrapperPath
}

// Read the argv log and return all captured argument lines.
async function readArgvLog(tmpDir: string): Promise<string[]> {
  const logPath = path.join(tmpDir, 'argv_log.txt')
  try {
    const raw = await fs.readFile(logPath, 'utf-8')
    return raw.split('\n').filter(Boolean)
  } catch {
    return []
  }
}

// Helper: clear the argv log between calls.
async function clearArgvLog(tmpDir: string): Promise<void> {
  const logPath = path.join(tmpDir, 'argv_log.txt')
  await fs.writeFile(logPath, '', 'utf-8').catch(() => undefined)
}

describe('HUB-03 session-continuity contract', () => {
  let tmpCache: string
  let claudeSpy: string
  const prevCacheDir = process.env.AIOS_CACHE_DIR

  beforeEach(async () => {
    tmpCache = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-session-contract-'))
    process.env.AIOS_CACHE_DIR = tmpCache
    // Verify the fake binary is executable.
    execSync(`chmod +x "${FAKE_CHAT}"`)
    claudeSpy = await createArgvLoggingWrapper(tmpCache, FAKE_CHAT)
  })

  afterEach(async () => {
    if (prevCacheDir === undefined) delete process.env.AIOS_CACHE_DIR
    else process.env.AIOS_CACHE_DIR = prevCacheDir
    await fs.rm(tmpCache, { recursive: true, force: true })
  })

  it('Test 1 — fresh load: claude spawned WITHOUT --resume; sessionId captured from subprocess output', async () => {
    const result = await runChatLoad({
      claudeBin: claudeSpy,
      brief: '# Test project brief\n\nProject context here.',
      projectLabel: 'Test Client — Test Project',
      timeoutMs: 10_000,
    })

    const args = await readArgvLog(tmpCache)

    // Success with session id from fake-claude-chat.sh.
    expect(result.status).toBe('success')
    expect(result.sessionId).toBe('sess_loaded_xyz')

    // --resume must NOT be in the args for a fresh load.
    expect(args).not.toContain('--resume')
    // Standard args must be present.
    expect(args).toContain('--print')
    expect(args).toContain('--output-format')
    expect(args).toContain('stream-json')
  })

  it('Test 2 — subsequent message: claude spawned WITH --resume <sessionId>', async () => {
    const FAKE_SESSION_ID = 'fake-session-uuid-123'

    const result = await runChatMessage({
      claudeBin: claudeSpy,
      sessionId: FAKE_SESSION_ID,
      message: 'What is the project status?',
      timeoutMs: 10_000,
    })

    const args = await readArgvLog(tmpCache)

    expect(result.status).toBe('success')

    // --resume must appear immediately followed by the session id.
    const resumeIdx = args.indexOf('--resume')
    expect(resumeIdx).toBeGreaterThanOrEqual(0)
    expect(args[resumeIdx + 1]).toBe(FAKE_SESSION_ID)
  })

  it('Test 3 — bootstrap-rewrite invariance: seed via assembleSeedPrompt does not alter --resume arg path', async () => {
    // Simulate what the Task 3 /load route now does: assemble the seed via
    // chat-bootstrap.ts and pass it as the `brief` to runChatLoad.
    const seed = assembleSeedPrompt({
      projectLabel: 'Test Client — Test Project',
      brief: '# Project brief body\n\nStatus: in progress.',
      gmail: '| t1 | Subject A | meghan | 2026-05-20 | greeting |',
      calendar: '- Kickoff sync — 2026-05-22T15:00:00Z',
    })

    // Seed must be a non-trivial multi-section context bundle.
    expect(seed).toContain('context bundle')
    expect(seed).toContain('## Recent Gmail threads')
    expect(seed).toContain('## Upcoming calendar events')
    expect(seed).toContain("I'm working on Test Client")

    // --- Fresh load with the assembled seed ---
    const loadResult = await runChatLoad({
      claudeBin: claudeSpy,
      brief: seed,
      projectLabel: 'Test Client — Test Project',
      timeoutMs: 10_000,
    })

    const loadArgs = await readArgvLog(tmpCache)
    expect(loadResult.status).toBe('success')
    expect(loadResult.sessionId).toBe('sess_loaded_xyz')
    // No --resume on first load.
    expect(loadArgs).not.toContain('--resume')

    // --- Subsequent message with the session id captured from load ---
    await clearArgvLog(tmpCache)
    const FAKE_SESSION_ID = 'fake-session-uuid-456'

    const msgResult = await runChatMessage({
      claudeBin: claudeSpy,
      sessionId: FAKE_SESSION_ID,
      message: 'What did I just ask?',
      timeoutMs: 10_000,
    })

    const msgArgs = await readArgvLog(tmpCache)
    expect(msgResult.status).toBe('success')

    // --resume must appear with the correct session id.
    const resumeIdx = msgArgs.indexOf('--resume')
    expect(resumeIdx).toBeGreaterThanOrEqual(0)
    expect(msgArgs[resumeIdx + 1]).toBe(FAKE_SESSION_ID)
  })
})
