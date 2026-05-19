import { describe, it, expect } from 'vitest'
import path from 'path'
import { resolveDocsPaths, loadReferenceFile } from '@/lib/data/references'

describe('references loader', () => {
  it('resolves relative docs_paths against CLAUDE_OS_ROOT', () => {
    const resolved = resolveDocsPaths(['references/inside-out-project.md'])
    expect(resolved[0]).toContain('references/inside-out-project.md')
    expect(path.isAbsolute(resolved[0])).toBe(true)
  })

  it('passes through absolute docs_paths unchanged', () => {
    const resolved = resolveDocsPaths(['/Users/test/somewhere/file.md'])
    expect(resolved[0]).toBe('/Users/test/somewhere/file.md')
  })

  it('returns empty array for undefined or empty input', () => {
    expect(resolveDocsPaths(undefined)).toEqual([])
    expect(resolveDocsPaths([])).toEqual([])
  })

  it('loadReferenceFile returns file content and mtime', async () => {
    const resolved = resolveDocsPaths(['references/inside-out-project.md'])
    const file = await loadReferenceFile(resolved[0])
    expect(file).not.toBeNull()
    expect(file!.body).toContain('Inside Out — Reference')
    expect(file!.mtime).toBeInstanceOf(Date)
  })

  it('loadReferenceFile returns null when the file is missing', async () => {
    const file = await loadReferenceFile('/tmp/does-not-exist-12345.md')
    expect(file).toBeNull()
  })
})
