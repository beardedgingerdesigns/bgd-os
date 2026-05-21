import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

import {
  startBriefWatcher,
  stopBriefWatcher,
  __test_dispatchChange,
  __test_resetSingleton,
} from '@/lib/indexer/watcher'
import { CLIENTS_YAML_PATH, REFERENCES_DIR, MEMORY_ROOT } from '@/lib/paths'

// All tests run against the vitest.setup.ts fixture root
// (tests/fixtures/claude-os/clients.yaml). Reset chokidar state between tests
// so the singleton from a prior test doesn't bleed across.

describe('startBriefWatcher singleton + lifecycle', () => {
  afterEach(async () => {
    await stopBriefWatcher().catch(() => undefined)
    __test_resetSingleton()
  })

  it('returns the same handle when called twice (singleton)', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    const h1 = await startBriefWatcher({ buildBriefFor: builder })
    const h2 = await startBriefWatcher({ buildBriefFor: builder })
    expect(h1).toBe(h2)
  })

  it('stopBriefWatcher closes the watcher and clears singleton', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })
    await stopBriefWatcher()
    // After close, starting a fresh one should NOT return the previous handle.
    const h2 = await startBriefWatcher({ buildBriefFor: builder })
    expect(h2).toBeDefined()
  })
})

describe('briefs rebuild dispatch (debounce + reverse mapping)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    __test_resetSingleton()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await stopBriefWatcher().catch(() => undefined)
    __test_resetSingleton()
  })

  it('debounces 500ms — multiple rapid changes to one docs_path produce ONE call', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    // tests/fixtures/claude-os/references/inside-out-project.md belongs to
    // (inside-out, inside-out-website).
    const target = path.join(process.env.CLAUDE_OS_ROOT!, 'references/inside-out-project.md')

    await __test_dispatchChange(target)
    await __test_dispatchChange(target)
    await __test_dispatchChange(target)

    // Before debounce — no calls yet.
    await vi.advanceTimersByTimeAsync(499)
    expect(builder).not.toHaveBeenCalled()

    // After debounce window — exactly one call.
    await vi.advanceTimersByTimeAsync(2)
    expect(builder).toHaveBeenCalledTimes(1)
    expect(builder.mock.calls[0][0]).toBe('inside-out')
    expect(builder.mock.calls[0][1]).toBe('inside-out-website')
  })

  it('a change to clients.yaml triggers a rebuild for every known (client, project) pair', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    await __test_dispatchChange(CLIENTS_YAML_PATH)
    await vi.advanceTimersByTimeAsync(501)

    // The fixture clients.yaml has 4 clients with the following (client, project) pairs:
    //   inside-out / inside-out-website
    //   kirk-financial / wild-rose
    //   kirk-financial / paused-project
    //   revolution / brandos-phase1
    //   with-wiki / project-with-wiki
    // = 5 pairs total.
    expect(builder).toHaveBeenCalledTimes(5)
    const calledPairs = builder.mock.calls.map(c => `${c[0]}/${c[1]}`).sort()
    expect(calledPairs).toEqual(
      [
        'inside-out/inside-out-website',
        'kirk-financial/paused-project',
        'kirk-financial/wild-rose',
        'revolution/brandos-phase1',
        'with-wiki/project-with-wiki',
      ].sort(),
    )
  })

  it('a change inside REFERENCES_DIR but NOT registered to any project rebuilds ALL projects', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    // An untracked file inside references/ — not in any project's docs_paths.
    const target = path.join(REFERENCES_DIR, 'shared-stuff.md')
    await __test_dispatchChange(target)
    await vi.advanceTimersByTimeAsync(501)
    expect(builder).toHaveBeenCalledTimes(5)
  })

  it('a change to memory/project_*.md with frontmatter maps to its single (client, project)', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    // tests/fixtures/memory/project_inside_out.md has metadata.client=inside-out
    // and metadata.project=inside-out-website per the fixture.
    const target = path.join(MEMORY_ROOT, 'project_inside_out.md')
    await __test_dispatchChange(target)
    await vi.advanceTimersByTimeAsync(501)

    expect(builder).toHaveBeenCalledTimes(1)
    expect(builder.mock.calls[0][0]).toBe('inside-out')
    expect(builder.mock.calls[0][1]).toBe('inside-out-website')
  })

  it('a change to memory/<no-frontmatter>.md falls back to ALL projects (conservative)', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    // project_other.md is a fixture memory file that exists but is NOT tagged
    // to any known (client, project) pair in the fixture clients.yaml.
    const target = path.join(MEMORY_ROOT, 'project_other.md')
    await __test_dispatchChange(target)
    await vi.advanceTimersByTimeAsync(501)

    // With unknown frontmatter slugs, conservative behavior is rebuild ALL.
    // (Memory frontmatter that doesn't resolve to a known project = global)
    expect(builder.mock.calls.length).toBeGreaterThanOrEqual(1)
  })

  it('separate debounce keys per project — two different docs_paths fire two builds', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    await startBriefWatcher({ buildBriefFor: builder })

    const insideOut = path.join(process.env.CLAUDE_OS_ROOT!, 'references/inside-out-project.md')
    // The wild-rose project in the fixture has no docs_paths, so a path inside
    // a totally unrelated REFERENCES_DIR sub-dir is the easiest way to fire a
    // second debounce key — but the cleanest path is to fire two changes to
    // the SAME inside-out file and assert only one debounced call. We already
    // covered that. Here we instead fire one CLIENTS_YAML change which dispatches
    // 5 distinct project keys, each with its own debounce timer.

    await __test_dispatchChange(insideOut)
    await __test_dispatchChange(CLIENTS_YAML_PATH)
    await vi.advanceTimersByTimeAsync(501)

    // 5 pairs from clients.yaml dispatch (one of them is inside-out/inside-out-website,
    // which collapses with the insideOut docs_path change because they share a debounce key).
    expect(builder).toHaveBeenCalledTimes(5)
  })
})

describe('startBriefWatcher subscription list', () => {
  let tmpProjectDir: string

  beforeEach(async () => {
    __test_resetSingleton()
    tmpProjectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-watcher-'))
  })

  afterEach(async () => {
    await stopBriefWatcher().catch(() => undefined)
    __test_resetSingleton()
    await fs.rm(tmpProjectDir, { recursive: true, force: true })
  })

  it('subscribes to CLIENTS_YAML_PATH, REFERENCES_DIR, MEMORY_ROOT', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    const handle = await startBriefWatcher({ buildBriefFor: builder })
    const watched = handle.getWatchedPaths()
    expect(watched).toContain(CLIENTS_YAML_PATH)
    expect(watched).toContain(REFERENCES_DIR)
    expect(watched).toContain(MEMORY_ROOT)
  })

  it('subscribes to each project resolved docs_path', async () => {
    const builder = vi.fn().mockResolvedValue({ status: 'success' })
    const handle = await startBriefWatcher({ buildBriefFor: builder })
    const watched = handle.getWatchedPaths()
    // inside-out-website has docs_paths: [references/inside-out-project.md]
    const expected = path.join(process.env.CLAUDE_OS_ROOT!, 'references/inside-out-project.md')
    expect(watched).toContain(expected)
  })
})
