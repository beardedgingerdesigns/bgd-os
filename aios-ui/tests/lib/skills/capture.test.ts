import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { runCapture } from '@/lib/skills/capture'
import { receiptsPath } from '@/lib/cache/receipts'
import { invalidate as invalidateClients } from '@/lib/data/clients'

const FAKE_CAPTURE = path.resolve(__dirname, '../../fixtures/fake-claude-capture.sh')
const FAKE_CAPTURE_WITH_PATH = path.resolve(
  __dirname,
  '../../fixtures/fake-claude-capture-with-path.sh',
)

// `inside-out` / `inside-out-website` has docs_paths but they point at a
// reference .md file, NOT a wiki — resolveProjectWikiPath returns null for it,
// so existing subprocess tests stay subprocess-only.
const NO_WIKI_CLIENT = 'inside-out'
const NO_WIKI_PROJECT = 'inside-out-website'

describe('runCapture', () => {
  // The default fake-claude-capture.sh script emits no parseable absolute path,
  // so HUB-06's multi-regex path extractor will not match. Receipts should be
  // suppressed in every test below, but we still set AIOS_CACHE_DIR per-test so
  // any accidental emissions are visible.
  let cacheDir: string

  beforeEach(async () => {
    cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-capture-cache-'))
    process.env.AIOS_CACHE_DIR = cacheDir
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('streams text deltas and aggregates the assistant output', async () => {
    let streamed = ''
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'test capture content',
      projectLabel: 'Inside Out — Website redesign',
      clientSlug: NO_WIKI_CLIENT,
      projectSlug: NO_WIKI_PROJECT,
      timeoutMs: 10_000,
      onStdout: chunk => { streamed += chunk },
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Captured to memory')
    expect(result.output).toContain('feedback_capture_test')
    expect(streamed).toBe(result.output)
  })

  it('returns failed status on subprocess error', async () => {
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'x',
      projectLabel: 'x',
      clientSlug: NO_WIKI_CLIENT,
      projectSlug: NO_WIKI_PROJECT,
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).toBe(2)
    expect(result.error).toContain('simulated capture failure')
  })

  it('returns timeout status when subprocess exceeds the timeout', async () => {
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'x',
      projectLabel: 'x',
      clientSlug: NO_WIKI_CLIENT,
      projectSlug: NO_WIKI_PROJECT,
      args: ['--slow'],
      timeoutMs: 500,
    })
    expect(result.status).toBe('timeout')
  })
})

describe('runCapture wiki-aware branch (HUB-05) + receipt emission (HUB-06)', () => {
  const CLIENTS_YAML = path.resolve(
    __dirname,
    '../../fixtures/claude-os/clients.yaml',
  )
  const PLACEHOLDER = '/WILL_BE_REPLACED_AT_TEST_TIME'
  let originalYaml: string
  let tmpWiki: string
  let cacheDir: string

  beforeEach(async () => {
    originalYaml = await fs.readFile(CLIENTS_YAML, 'utf-8')
    tmpWiki = await fs.mkdtemp(path.join(os.tmpdir(), 'capture-wiki-'))
    cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'capture-receipts-'))
    process.env.AIOS_CACHE_DIR = cacheDir
  })

  afterEach(async () => {
    await fs.writeFile(CLIENTS_YAML, originalYaml, 'utf-8')
    invalidateClients()
    await fs.rm(tmpWiki, { recursive: true, force: true })
    await fs.rm(cacheDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  async function pointWithWikiAt(absPath: string): Promise<void> {
    const patched = originalYaml.replace(PLACEHOLDER, absPath)
    await fs.writeFile(CLIENTS_YAML, patched, 'utf-8')
    invalidateClients()
  }

  async function makeWiki(): Promise<void> {
    await fs.writeFile(path.join(tmpWiki, 'WIKI-CLAUDE.md'), '# Wiki\n', 'utf-8')
  }

  async function countReceiptLines(): Promise<number> {
    try {
      const raw = await fs.readFile(receiptsPath(), 'utf-8')
      return raw.split('\n').filter(Boolean).length
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return 0
      throw err
    }
  }

  async function readReceiptLines(): Promise<Array<Record<string, unknown>>> {
    try {
      const raw = await fs.readFile(receiptsPath(), 'utf-8')
      return raw
        .split('\n')
        .filter(Boolean)
        .map(l => JSON.parse(l) as Record<string, unknown>)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw err
    }
  }

  it('writes directly to {wiki}/raw/aios and emits exactly one capture receipt', async () => {
    await makeWiki()
    await pointWithWikiAt(tmpWiki)

    const result = await runCapture({
      // claudeBin should NEVER be invoked here — wiki branch wins.
      claudeBin: '/nonexistent/should-not-be-called',
      text: 'meghan handoff verification capture',
      projectLabel: 'Test Client With Wiki — Project that has an LLM-wiki',
      clientSlug: 'with-wiki',
      projectSlug: 'project-with-wiki',
      timeoutMs: 10_000,
    })

    expect(result.status).toBe('success')
    expect(result.fileWritten).toBeDefined()
    expect(result.fileWritten!.startsWith(path.join(tmpWiki, 'raw', 'aios')))
      .toBe(true)
    expect(result.fileWritten!.endsWith('.md')).toBe(true)
    // Filename uses the canonical slugified prefix.
    expect(path.basename(result.fileWritten!)).toMatch(
      /^capture-\d{4}-\d{2}-\d{2}-meghan-handoff-verification-capture\.md$/,
    )

    const onDisk = await fs.readFile(result.fileWritten!, 'utf-8')
    expect(onDisk).toContain('meghan handoff verification capture')
    expect(onDisk).toContain('project: Test Client With Wiki')
    expect(onDisk).toContain('source: aios-ui capture-box')

    const receipts = await readReceiptLines()
    expect(receipts).toHaveLength(1)
    expect(receipts[0].kind).toBe('capture')
    expect(receipts[0].project_slug).toBe('project-with-wiki')
    expect(receipts[0].file_written).toBe(result.fileWritten)
    expect(receipts[0].actor).toBe('capture-box')
    expect(String(receipts[0].excerpt)).toContain('meghan handoff')
  })

  it('subprocess branch with a parseable absolute path emits exactly one receipt', async () => {
    // No wiki — runCapture falls through to subprocess. Fake binary emits
    // "Wrote capture to <emittedPath>" which R1 must match.
    const emittedPath = path.join(tmpWiki, 'memory', 'feedback_subprocess.md')

    const result = await runCapture({
      claudeBin: FAKE_CAPTURE_WITH_PATH,
      text: 'subprocess capture content',
      projectLabel: 'Inside Out — Website redesign',
      clientSlug: NO_WIKI_CLIENT,
      projectSlug: NO_WIKI_PROJECT,
      args: [`--emit-path=${emittedPath}`],
      timeoutMs: 10_000,
    })

    expect(result.status).toBe('success')
    expect(result.fileWritten).toBe(emittedPath)

    const receipts = await readReceiptLines()
    expect(receipts).toHaveLength(1)
    expect(receipts[0].kind).toBe('capture')
    expect(receipts[0].project_slug).toBe(NO_WIKI_PROJECT)
    expect(receipts[0].file_written).toBe(emittedPath)
    expect(receipts[0].actor).toBe('capture-box')
  })

  it('subprocess branch with NO parseable path SKIPS the receipt (honors HUB-06)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const before = await countReceiptLines()

      const result = await runCapture({
        claudeBin: FAKE_CAPTURE_WITH_PATH,
        text: 'no path emitted',
        projectLabel: 'Inside Out — Website redesign',
        clientSlug: NO_WIKI_CLIENT,
        projectSlug: NO_WIKI_PROJECT,
        args: ['--no-path'],
        timeoutMs: 10_000,
      })

      // Capture itself still succeeded.
      expect(result.status).toBe('success')
      expect(result.fileWritten).toBeUndefined()

      // CRITICAL HUB-06 invariant: no receipt with an empty path was emitted.
      const after = await countReceiptLines()
      expect(after).toBe(before)

      // The warning must have been logged so operators can debug missing receipts.
      const warnedSuppression = warnSpy.mock.calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('receipt suppressed')),
      )
      expect(warnedSuppression).toBe(true)
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('falls back to subprocess when writeRawDrop throws (e.g. wiki path unwritable)', async () => {
    // Point the wiki path at a FILE — fs.mkdir({recursive:true}) on
    // {file}/raw/aios will reject with ENOTDIR, so writeRawDrop fails and we
    // fall through to the subprocess branch.
    const wikiAsFile = path.join(tmpWiki, 'not-a-dir.md')
    await fs.writeFile(wikiAsFile, '# pretend wiki\n', 'utf-8')
    // Also drop a WIKI-CLAUDE.md sibling so detectWiki accepts tmpWiki as a wiki.
    await makeWiki()
    // Point with-wiki at the FILE so detectWiki returns null normally —
    // but we want detectWiki to succeed AND writeRawDrop to fail. So instead
    // point with-wiki at tmpWiki (wiki) and chmod raw/ to be unwritable.
    // Simpler: pre-create raw/aios as a regular file so mkdir(recursive) fails.
    await fs.mkdir(path.join(tmpWiki, 'raw'), { recursive: true })
    await fs.writeFile(path.join(tmpWiki, 'raw', 'aios'), 'i am a file', 'utf-8')

    await pointWithWikiAt(tmpWiki)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const emittedPath = path.join(tmpWiki, 'memory', 'fallback.md')
      const result = await runCapture({
        claudeBin: FAKE_CAPTURE_WITH_PATH,
        text: 'fallback capture',
        projectLabel: 'Test Client With Wiki — Project that has an LLM-wiki',
        clientSlug: 'with-wiki',
        projectSlug: 'project-with-wiki',
        args: [`--emit-path=${emittedPath}`],
        timeoutMs: 10_000,
      })

      expect(result.status).toBe('success')
      expect(result.fileWritten).toBe(emittedPath)

      const receipts = await readReceiptLines()
      expect(receipts).toHaveLength(1)
      expect(receipts[0].file_written).toBe(emittedPath)

      const warnedFallback = warnSpy.mock.calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('wiki-aware write failed')),
      )
      expect(warnedFallback).toBe(true)
    } finally {
      warnSpy.mockRestore()
    }
  })
})
