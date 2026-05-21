import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { briefPathFor, buildBriefFor } from '@/lib/indexer/build-brief'

const FAKE_LOAD_PROJECT = path.resolve(__dirname, '../../fixtures/fake-claude-load-project.sh')

describe('briefPathFor', () => {
  it('returns AIOS_CACHE_DIR/briefs/<client>__<project>.md', () => {
    const prev = process.env.AIOS_CACHE_DIR
    process.env.AIOS_CACHE_DIR = '/tmp/test-cache'
    try {
      const p = briefPathFor('inside-out', 'inside-out-website')
      expect(p).toBe(path.join('/tmp/test-cache', 'briefs', 'inside-out__inside-out-website.md'))
    } finally {
      if (prev === undefined) delete process.env.AIOS_CACHE_DIR
      else process.env.AIOS_CACHE_DIR = prev
    }
  })

  it('falls back to cwd()/.aios-cache when AIOS_CACHE_DIR unset', () => {
    const prev = process.env.AIOS_CACHE_DIR
    delete process.env.AIOS_CACHE_DIR
    try {
      const p = briefPathFor('foo', 'bar')
      expect(p).toBe(path.join(process.cwd(), '.aios-cache', 'briefs', 'foo__bar.md'))
    } finally {
      if (prev !== undefined) process.env.AIOS_CACHE_DIR = prev
    }
  })
})

describe('buildBriefFor', () => {
  let tmpCache: string
  const prevCacheDir = process.env.AIOS_CACHE_DIR

  beforeEach(async () => {
    tmpCache = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-brief-cache-'))
    process.env.AIOS_CACHE_DIR = tmpCache
  })

  afterEach(async () => {
    if (prevCacheDir === undefined) delete process.env.AIOS_CACHE_DIR
    else process.env.AIOS_CACHE_DIR = prevCacheDir
    await fs.rm(tmpCache, { recursive: true, force: true })
  })

  it('runs /load-project subprocess and writes aggregated stdout to the brief file', async () => {
    const result = await buildBriefFor('inside-out', 'inside-out-website', {
      claudeBin: FAKE_LOAD_PROJECT,
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(result.builtAt).toMatch(/\d{4}-\d{2}-\d{2}T/)
    expect(result.filePath).toBe(
      path.join(tmpCache, 'briefs', 'inside-out__inside-out-website.md'),
    )
    const written = await fs.readFile(result.filePath, 'utf-8')
    // Aggregated text only — no JSON envelope noise.
    expect(written).toContain('## Project: Inside Out')
    expect(written).toContain('Hello from /load-project subprocess.')
    expect(written).not.toContain('stream_event')
    expect(written).not.toContain('hook_started')
  })

  it('falls back to buildProjectBrief when subprocess exits non-zero (file still written)', async () => {
    // The vitest setup pins CLAUDE_OS_ROOT to tests/fixtures/claude-os/, so
    // buildProjectBrief('inside-out', 'inside-out-website') resolves to a real
    // fixture client/project — the fallback should produce content from the
    // filesystem layer.
    const result = await buildBriefFor('inside-out', 'inside-out-website', {
      claudeBin: FAKE_LOAD_PROJECT,
      claudeArgs: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('fallback')
    expect(result.error).toBeDefined()
    const written = await fs.readFile(result.filePath, 'utf-8')
    // buildProjectBrief produces a `# <Client> — <Project>` header.
    expect(written).toContain('Inside Out')
    expect(written).toContain('Website redesign')
  })

  it('falls back to buildProjectBrief on subprocess timeout', async () => {
    const result = await buildBriefFor('inside-out', 'inside-out-website', {
      claudeBin: FAKE_LOAD_PROJECT,
      claudeArgs: ['--slow'],
      timeoutMs: 200,
    })
    expect(result.status).toBe('fallback')
    expect(result.error).toBeDefined()
    expect(result.error?.toLowerCase()).toContain('timeout')
    const written = await fs.readFile(result.filePath, 'utf-8')
    expect(written).toContain('Inside Out')
  })

  it('creates the briefs/ directory if missing', async () => {
    const briefsDir = path.join(tmpCache, 'briefs')
    // Sanity: dir doesn't exist before the call.
    await expect(fs.stat(briefsDir)).rejects.toThrow()
    await buildBriefFor('inside-out', 'inside-out-website', {
      claudeBin: FAKE_LOAD_PROJECT,
      timeoutMs: 10_000,
    })
    const stat = await fs.stat(briefsDir)
    expect(stat.isDirectory()).toBe(true)
  })
})
