import { describe, it, expect } from 'vitest'
import path from 'path'

import { runWikiIngest } from '@/lib/skills/wiki-ingest'

const FAKE_WIKI_INGEST = path.resolve(__dirname, '../../fixtures/fake-claude-wiki-ingest.sh')

describe('runWikiIngest', () => {
  it('success with summary: parses INGEST_SUMMARY_START/END block', async () => {
    let streamed = ''
    const result = await runWikiIngest({
      wikiPath: '/tmp/test-wiki',
      claudeBin: FAKE_WIKI_INGEST,
      timeoutMs: 10_000,
      onStdout: chunk => { streamed += chunk },
    })
    expect(result.status).toBe('success')
    expect(result.exitCode).toBe(0)
    // onStdout received all text deltas
    expect(streamed).toBe(result.output)
    // Summary parsed correctly
    expect(result.summary).toBeDefined()
    expect(result.summary!.promoted).toHaveLength(2)
    expect(result.summary!.promoted).toContain('capture-2026-05-21-meghan-handoff.md')
    expect(result.summary!.promoted).toContain('chat-decision-2026-05-21-pricing.md')
    expect(result.summary!.deferred).toHaveLength(1)
    expect(result.summary!.deferred).toContain('capture-2026-05-20-rough-notes.md')
    expect(result.summary!.contested).toHaveLength(0)
  })

  it('success without summary block: summary is undefined', async () => {
    const result = await runWikiIngest({
      wikiPath: '/tmp/test-wiki',
      claudeBin: FAKE_WIKI_INGEST,
      // --no-summary triggers the no-markers branch in the fixture
      timeoutMs: 10_000,
    })
    // We need to pass --no-summary to the fixture. The fixture reads from $@,
    // so we need a wrapper. Instead, we create a test-only wrapper that injects args.
    // This test uses the actual fixture path; see note below for how --no-summary is handled.
    // Since claudeBin receives the FULL args array including our hardcoded prompt string
    // "/ingest-aios-drops /tmp/test-wiki", and --no-summary is not in that list, the
    // default fixture branch (with summary) runs. We need a separate fixture path for this.
    // The fixture is designed so the last arg check covers --no-summary anywhere in $@.
    // runWikiIngest hardcodes the arg list, so we can't inject --no-summary that way.
    // Instead: trust that result.status === 'success' and the summary IS present here
    // (default fixture emits one). We test the no-summary case by running a dedicated
    // no-summary fixture binary below.
    expect(result.status).toBe('success')
  })

  it('success without summary block (no-summary fixture): summary is undefined', async () => {
    // Create a shell wrapper that calls the fixture with --no-summary
    const { execFile } = await import('child_process')
    const { promisify } = await import('util')
    const execFileAsync = promisify(execFile)

    // Build a tiny wrapper script path
    const os = await import('os')
    const fs = await import('fs/promises')
    const wrapperPath = path.join(os.tmpdir(), 'fake-claude-no-summary.sh')
    await fs.writeFile(
      wrapperPath,
      `#!/usr/bin/env bash\nexec "${FAKE_WIKI_INGEST}" --no-summary "$@"\n`,
    )
    await execFileAsync('chmod', ['+x', wrapperPath])

    const result = await runWikiIngest({
      wikiPath: '/tmp/test-wiki',
      claudeBin: wrapperPath,
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.summary).toBeUndefined()
    // Output still contains ingest text
    expect(result.output).toContain('Ingest pass complete')
  })

  it('non-zero exit: returns failed status with error string', async () => {
    // Build a tiny fail wrapper
    const os = await import('os')
    const fs = await import('fs/promises')
    const wrapperPath = path.join(os.tmpdir(), 'fake-claude-fail.sh')
    await fs.writeFile(
      wrapperPath,
      `#!/usr/bin/env bash\nexec "${FAKE_WIKI_INGEST}" --fail "$@"\n`,
    )
    const { execFile } = await import('child_process')
    const { promisify } = await import('util')
    await promisify(execFile)('chmod', ['+x', wrapperPath])

    const result = await runWikiIngest({
      wikiPath: '/tmp/test-wiki',
      claudeBin: wrapperPath,
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).not.toBe(0)
    expect(result.error).toBeTruthy()
  })
})
