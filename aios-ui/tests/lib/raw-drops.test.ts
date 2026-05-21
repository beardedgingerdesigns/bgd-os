import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

import { slugify, buildRawDropPath, writeRawDrop } from '@/lib/raw-drops'

describe('slugify', () => {
  it('lowercases and hyphenates a multi-word phrase', () => {
    expect(slugify('Verification capture about Meghan handoff')).toBe(
      'verification-capture-about-meghan-handoff',
    )
  })

  it('strips leading/trailing whitespace and punctuation', () => {
    expect(slugify('  spaces & punc!! ')).toBe('spaces-punc')
  })

  it('caps the result at 60 chars', () => {
    const out = slugify('a'.repeat(100))
    expect(out.length).toBeLessThanOrEqual(60)
    expect(out.length).toBe(60)
  })

  it('returns "untitled" for an empty input', () => {
    expect(slugify('')).toBe('untitled')
  })

  it('returns "untitled" when input contains only stripped chars', () => {
    expect(slugify('!!!  ###')).toBe('untitled')
  })

  it('collapses repeated separators', () => {
    expect(slugify('hello---world___test')).toBe('hello-world-test')
  })
})

describe('buildRawDropPath', () => {
  it('builds the canonical raw/aios/<kind>-YYYY-MM-DD-<slug>.md path for capture', () => {
    expect(
      buildRawDropPath({
        wikiPath: '/tmp/w',
        kind: 'capture',
        date: new Date('2026-05-21T12:00:00Z'),
        slug: 'foo',
      }),
    ).toBe('/tmp/w/raw/aios/capture-2026-05-21-foo.md')
  })

  it('uses the chat-decision kind verbatim in the filename prefix', () => {
    expect(
      buildRawDropPath({
        wikiPath: '/tmp/w',
        kind: 'chat-decision',
        date: new Date('2026-05-21T12:00:00Z'),
        slug: 'foo',
      }),
    ).toBe('/tmp/w/raw/aios/chat-decision-2026-05-21-foo.md')
  })

  it('uses the chat-session kind verbatim in the filename prefix', () => {
    expect(
      buildRawDropPath({
        wikiPath: '/tmp/w',
        kind: 'chat-session',
        date: new Date('2026-05-21T12:00:00Z'),
        slug: 'foo',
      }),
    ).toBe('/tmp/w/raw/aios/chat-session-2026-05-21-foo.md')
  })

  it('defaults date to new Date() when omitted', () => {
    const out = buildRawDropPath({ wikiPath: '/tmp/w', kind: 'capture', slug: 'foo' })
    expect(out).toMatch(/\/tmp\/w\/raw\/aios\/capture-\d{4}-\d{2}-\d{2}-foo\.md$/)
  })
})

describe('writeRawDrop', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `aios-raw-drops-${crypto.randomUUID()}-`))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('creates raw/aios/ directories on first write and returns absolute path + excerpt', async () => {
    const result = await writeRawDrop({
      wikiPath: tmpDir,
      kind: 'capture',
      slug: 'hello-world',
      body: 'This is the body of the capture.',
      date: new Date('2026-05-21T12:00:00Z'),
    })
    expect(result.filePath).toBe(
      path.join(tmpDir, 'raw', 'aios', 'capture-2026-05-21-hello-world.md'),
    )
    expect(result.excerpt).toBe('This is the body of the capture.')
    const contents = await fs.readFile(result.filePath, 'utf-8')
    expect(contents).toBe('This is the body of the capture.')
  })

  it('returns excerpt of exactly 240 chars when body is 300 chars', async () => {
    const body = 'x'.repeat(300)
    const result = await writeRawDrop({
      wikiPath: tmpDir,
      kind: 'capture',
      slug: 'big',
      body,
      date: new Date('2026-05-21T12:00:00Z'),
    })
    expect(result.excerpt.length).toBe(240)
    expect(result.excerpt).toBe(body.slice(0, 240))
  })

  it('appends -2 suffix on collision', async () => {
    const args = {
      wikiPath: tmpDir,
      kind: 'capture' as const,
      slug: 'dup',
      body: 'first',
      date: new Date('2026-05-21T12:00:00Z'),
    }
    const first = await writeRawDrop(args)
    const second = await writeRawDrop({ ...args, body: 'second' })
    expect(first.filePath).toBe(
      path.join(tmpDir, 'raw', 'aios', 'capture-2026-05-21-dup.md'),
    )
    expect(second.filePath).toBe(
      path.join(tmpDir, 'raw', 'aios', 'capture-2026-05-21-dup-2.md'),
    )
    const firstContents = await fs.readFile(first.filePath, 'utf-8')
    const secondContents = await fs.readFile(second.filePath, 'utf-8')
    expect(firstContents).toBe('first')
    expect(secondContents).toBe('second')
  })

  it('appends -3 on a second collision', async () => {
    const args = {
      wikiPath: tmpDir,
      kind: 'capture' as const,
      slug: 'dup',
      body: 'x',
      date: new Date('2026-05-21T12:00:00Z'),
    }
    await writeRawDrop(args)
    await writeRawDrop(args)
    const third = await writeRawDrop(args)
    expect(third.filePath).toBe(
      path.join(tmpDir, 'raw', 'aios', 'capture-2026-05-21-dup-3.md'),
    )
  })
})
