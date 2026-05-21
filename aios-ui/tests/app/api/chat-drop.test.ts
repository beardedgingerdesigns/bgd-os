import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { POST as dropDecisionPOST } from '@/app/api/chat/[client]/[project]/drop-decision/route'
import { readRecentReceipts } from '@/lib/cache/receipts'
import { invalidate as invalidateClients } from '@/lib/data/clients'

const CLIENTS_YAML = path.resolve(__dirname, '../../fixtures/claude-os/clients.yaml')
const PLACEHOLDER = '/WILL_BE_REPLACED_AT_TEST_TIME'

function asParams(client: string, project: string) {
  return { params: Promise.resolve({ client, project }) }
}

describe('POST /api/chat/[client]/[project]/drop-decision', () => {
  let originalYaml: string
  let tmpWiki: string
  let cacheDir: string

  beforeEach(async () => {
    originalYaml = await fs.readFile(CLIENTS_YAML, 'utf-8')
    tmpWiki = await fs.mkdtemp(path.join(os.tmpdir(), 'chat-drop-wiki-'))
    cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chat-drop-cache-'))
    process.env.AIOS_CACHE_DIR = cacheDir
  })

  afterEach(async () => {
    await fs.writeFile(CLIENTS_YAML, originalYaml, 'utf-8')
    invalidateClients()
    await fs.rm(tmpWiki, { recursive: true, force: true })
    await fs.rm(cacheDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  async function makeWiki(): Promise<void> {
    await fs.writeFile(path.join(tmpWiki, 'WIKI-CLAUDE.md'), '# Wiki\n', 'utf-8')
  }

  async function pointWithWikiAt(absPath: string): Promise<void> {
    const patched = originalYaml.replace(PLACEHOLDER, absPath)
    await fs.writeFile(CLIENTS_YAML, patched, 'utf-8')
    invalidateClients()
  }

  it('happy path: writes chat-decision raw drop and emits a chat_drop receipt', async () => {
    await makeWiki()
    await pointWithWikiAt(tmpWiki)

    const req = new Request(
      'http://test/api/chat/with-wiki/project-with-wiki/drop-decision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTurn: 'What is the launch date for Wild Rose?',
          assistantTurn: 'Launch is currently slipped to mid/late June 2026.',
        }),
      },
    )
    const res = await dropDecisionPOST(req, asParams('with-wiki', 'project-with-wiki'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(typeof body.filePath).toBe('string')
    expect(typeof body.receiptId).toBe('string')

    // File written under {wiki}/raw/aios with chat-decision prefix.
    expect(body.filePath.startsWith(path.join(tmpWiki, 'raw', 'aios'))).toBe(true)
    expect(path.basename(body.filePath)).toMatch(
      /^chat-decision-\d{4}-\d{2}-\d{2}-.+\.md$/,
    )
    const onDisk = await fs.readFile(body.filePath, 'utf-8')
    expect(onDisk).toContain('kind: chat-decision')
    expect(onDisk).toContain('## User')
    expect(onDisk).toContain('## Assistant')
    expect(onDisk).toContain('What is the launch date for Wild Rose?')
    expect(onDisk).toContain('Launch is currently slipped')
    expect(onDisk).toContain('project: Test Client With Wiki — Project that has an LLM-wiki')

    // Receipt emitted with project_slug = route-param project slug (verifies
    // we did NOT shadow the route param with a getProject() lookup).
    const receipts = await readRecentReceipts()
    expect(receipts).toHaveLength(1)
    expect(receipts[0].kind).toBe('chat_drop')
    expect(receipts[0].project_slug).toBe('project-with-wiki')
    expect(receipts[0].file_written).toBe(body.filePath)
    expect(receipts[0].actor).toBe('chat-drawer')
    expect(String(receipts[0].excerpt)).toContain('Launch is currently slipped')
  })

  it('returns 400 when project has no wiki path resolved', async () => {
    // inside-out has docs_paths but they do NOT point at a wiki, so
    // resolveProjectWikiPath returns null.
    const req = new Request(
      'http://test/api/chat/inside-out/inside-out-website/drop-decision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTurn: 'u',
          assistantTurn: 'a',
        }),
      },
    )
    const res = await dropDecisionPOST(req, asParams('inside-out', 'inside-out-website'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('no wiki path resolved')

    // No receipt emitted.
    const receipts = await readRecentReceipts()
    expect(receipts).toHaveLength(0)
  })

  it('returns 400 when userTurn is missing', async () => {
    await makeWiki()
    await pointWithWikiAt(tmpWiki)
    const req = new Request(
      'http://test/api/chat/with-wiki/project-with-wiki/drop-decision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantTurn: 'a' }),
      },
    )
    const res = await dropDecisionPOST(req, asParams('with-wiki', 'project-with-wiki'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('userTurn')
  })

  it('returns 400 when assistantTurn is missing', async () => {
    await makeWiki()
    await pointWithWikiAt(tmpWiki)
    const req = new Request(
      'http://test/api/chat/with-wiki/project-with-wiki/drop-decision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userTurn: 'u' }),
      },
    )
    const res = await dropDecisionPOST(req, asParams('with-wiki', 'project-with-wiki'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('assistantTurn')
  })

  it('returns 400 on invalid JSON body', async () => {
    await makeWiki()
    await pointWithWikiAt(tmpWiki)
    const req = new Request(
      'http://test/api/chat/with-wiki/project-with-wiki/drop-decision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      },
    )
    const res = await dropDecisionPOST(req, asParams('with-wiki', 'project-with-wiki'))
    expect(res.status).toBe(400)
  })
})
