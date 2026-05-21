import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { CLIENTS_YAML_PATH } from '@/lib/paths'
import { invalidate as invalidateClientsCache } from '@/lib/data/clients'
import { slugify } from '@/lib/utils'
import type { Bucket, Client, ClientsFile, Project, ProjectStatus } from '@/lib/types'

export { slugify }

// Comments in clients.yaml are load-bearing (top-level header + scattered
// inline TODOs and context). `js-yaml.dump` would strip them — so mutations
// append YAML fragments to the source text instead of round-tripping the
// whole file. We always re-parse the result before writing to guarantee a
// well-formed file.

export class DuplicateSlugError extends Error {
  readonly kind = 'duplicate-slug' as const
  constructor(message: string) {
    super(message)
    this.name = 'DuplicateSlugError'
  }
}

export class ClientNotFoundError extends Error {
  readonly kind = 'client-not-found' as const
  constructor(clientSlug: string) {
    super(`Client "${clientSlug}" not found`)
    this.name = 'ClientNotFoundError'
  }
}

export class InvalidSlugError extends Error {
  readonly kind = 'invalid-slug' as const
  constructor(message: string) {
    super(message)
    this.name = 'InvalidSlugError'
  }
}

export class MalformedYamlError extends Error {
  readonly kind = 'malformed-yaml' as const
  constructor(message: string) {
    super(message)
    this.name = 'MalformedYamlError'
  }
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const BUCKETS: readonly Bucket[] = ['paying', 'prospects', 'internal']
const STATUSES: readonly ProjectStatus[] = ['active', 'paused', 'done', 'archived']

export function assertValidSlug(slug: string, label: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new InvalidSlugError(
      `${label} slug "${slug}" must be kebab-case (lowercase letters, digits, hyphens; no leading/trailing hyphens)`,
    )
  }
}

export function isBucket(value: unknown): value is Bucket {
  return typeof value === 'string' && (BUCKETS as readonly string[]).includes(value)
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
}

// ---- file I/O helpers ----

async function readClientsText(): Promise<{ text: string; parsed: ClientsFile }> {
  let text: string
  try {
    text = await fs.readFile(CLIENTS_YAML_PATH, 'utf-8')
  } catch (err) {
    throw new MalformedYamlError(`could not read ${CLIENTS_YAML_PATH}: ${(err as Error).message}`)
  }
  let parsed: ClientsFile
  try {
    parsed = yaml.load(text) as ClientsFile
  } catch (err) {
    throw new MalformedYamlError(`could not parse ${CLIENTS_YAML_PATH}: ${(err as Error).message}`)
  }
  if (!parsed || !Array.isArray(parsed.clients)) {
    throw new MalformedYamlError(`clients.yaml does not have a top-level "clients:" array`)
  }
  return { text, parsed }
}

async function atomicWriteYaml(text: string): Promise<void> {
  const dir = path.dirname(CLIENTS_YAML_PATH)
  const tmp = path.join(
    dir,
    `.clients.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`,
  )
  const fh = await fs.open(tmp, 'w')
  try {
    await fh.writeFile(text, 'utf-8')
    await fh.sync()
  } finally {
    await fh.close()
  }
  await fs.rename(tmp, CLIENTS_YAML_PATH)
}

// ---- fragment generation ----

function dumpFragment(value: unknown, indentSpaces: number): string {
  // js-yaml.dump on an array produces "- key: value\n  key2: value2\n..."
  // We indent every non-empty line by `indentSpaces` and ensure a single
  // trailing newline.
  const raw = yaml.dump(value, { lineWidth: -1, noRefs: true })
  const prefix = ' '.repeat(indentSpaces)
  const indented = raw
    .split('\n')
    .map(line => (line.length > 0 ? prefix + line : line))
    .join('\n')
  return indented.replace(/\n*$/, '\n')
}

// ---- mutations ----

interface NewClientInput {
  slug: string
  name: string
  bucket: Bucket
  notes?: string
}

export async function addClient(input: NewClientInput): Promise<Client> {
  assertValidSlug(input.slug, 'client')
  if (!input.name.trim()) {
    throw new InvalidSlugError('client name cannot be empty')
  }
  if (!isBucket(input.bucket)) {
    throw new InvalidSlugError(`bucket must be one of ${BUCKETS.join(', ')}`)
  }

  const { text, parsed } = await readClientsText()
  if (parsed.clients.some(c => c.slug === input.slug)) {
    throw new DuplicateSlugError(`client slug "${input.slug}" already exists`)
  }

  // Build the new entry. Field order here drives the on-disk order for new
  // clients (slug → name → bucket → notes → projects), which roughly matches
  // existing entries' shape. Empty projects array dumps as `projects: []` —
  // when the user adds the first project we expand that inline form.
  const newClient: Client = {
    slug: input.slug,
    name: input.name.trim(),
    bucket: input.bucket,
    ...(input.notes && input.notes.trim() ? { notes: input.notes.trim() } : {}),
    projects: [],
  }

  // Top-level clients are at 2-space indent under `clients:`. Append fragment
  // to end of file after normalizing the trailing newline.
  const fragment = dumpFragment([newClient], 2)
  const normalized = text.replace(/\n+$/, '\n')
  const nextText = normalized + fragment

  // Round-trip validation: the result must parse, contain the new slug, and
  // preserve every existing slug. If any of those fail, refuse to write.
  validateRoundTrip(nextText, parsed, { newClientSlug: input.slug })

  await atomicWriteYaml(nextText)
  invalidateClientsCache()
  return newClient
}

interface NewProjectInput {
  slug: string
  name: string
  status: ProjectStatus
  contract?: string
  mrr_monthly?: number
  docs_paths?: string[]
  contacts?: string[]
}

export async function addProject(clientSlug: string, input: NewProjectInput): Promise<Project> {
  assertValidSlug(clientSlug, 'client')
  assertValidSlug(input.slug, 'project')
  if (!input.name.trim()) {
    throw new InvalidSlugError('project name cannot be empty')
  }
  if (!isProjectStatus(input.status)) {
    throw new InvalidSlugError(`status must be one of ${STATUSES.join(', ')}`)
  }
  if (input.mrr_monthly !== undefined && (!Number.isFinite(input.mrr_monthly) || input.mrr_monthly < 0)) {
    throw new InvalidSlugError('mrr_monthly must be a non-negative number')
  }

  const { text, parsed } = await readClientsText()
  const targetClient = parsed.clients.find(c => c.slug === clientSlug)
  if (!targetClient) throw new ClientNotFoundError(clientSlug)
  if (targetClient.projects.some(p => p.slug === input.slug)) {
    throw new DuplicateSlugError(
      `project slug "${input.slug}" already exists under client "${clientSlug}"`,
    )
  }

  const newProject: Project = {
    slug: input.slug,
    name: input.name.trim(),
    status: input.status,
    ...(input.contract && input.contract.trim() ? { contract: input.contract.trim() } : {}),
    ...(input.mrr_monthly !== undefined ? { mrr_monthly: input.mrr_monthly } : {}),
    ...(input.docs_paths && input.docs_paths.length > 0
      ? { docs_paths: input.docs_paths.map(s => s.trim()).filter(Boolean) }
      : {}),
    ...(input.contacts && input.contacts.length > 0
      ? { contacts: input.contacts.map(s => s.trim()).filter(Boolean) }
      : {}),
  }

  const nextText = insertProjectIntoClient(text, clientSlug, newProject)
  validateRoundTrip(nextText, parsed, { newProjectForClient: { clientSlug, projectSlug: input.slug } })

  await atomicWriteYaml(nextText)
  invalidateClientsCache()
  return newProject
}

// ---- text splicing ----

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Insert a project under the given client. Handles the two existing-file
// shapes we care about:
//   (a) Client already has projects expanded across multiple lines:
//         projects:
//           - slug: foo
//             ...
//       → append the new project fragment right after the last project's
//         last line, before the next client (or EOF).
//   (b) Client was just created and has an inline empty array:
//         projects: []
//       → replace that line with `projects:` followed by the new project
//         fragment.
// All other shapes (missing `projects:` key, mixed indentation, etc.) throw.
function insertProjectIntoClient(text: string, clientSlug: string, project: Project): string {
  const lines = text.split('\n')
  const clientLineRe = new RegExp(`^  - slug: ${escapeRegex(clientSlug)}(\\s|$)`)
  const anyClientLineRe = /^  - slug: /
  const inlineEmptyProjectsRe = /^    projects: \[\s*\]\s*$/
  const projectsKeyRe = /^    projects:\s*$/
  const projectEntryRe = /^      - slug: /

  let startIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (clientLineRe.test(lines[i])) {
      startIdx = i
      break
    }
  }
  if (startIdx < 0) {
    // The parser already confirmed this client exists, so the text shape must
    // diverge from our pattern. Refuse to guess.
    throw new MalformedYamlError(
      `could not locate "- slug: ${clientSlug}" at the expected 2-space indent`,
    )
  }

  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (anyClientLineRe.test(lines[i])) {
      endIdx = i
      break
    }
  }

  // Walk the client's block to find either an inline empty projects array or
  // an expanded projects array we can append to.
  let inlineEmptyIdx = -1
  let lastProjectStartIdx = -1
  let projectsKeyIdx = -1
  for (let i = startIdx + 1; i < endIdx; i++) {
    if (inlineEmptyProjectsRe.test(lines[i])) {
      inlineEmptyIdx = i
      break
    }
    if (projectsKeyRe.test(lines[i])) projectsKeyIdx = i
    if (projectEntryRe.test(lines[i])) lastProjectStartIdx = i
  }

  if (inlineEmptyIdx >= 0) {
    // Replace `    projects: []` with `    projects:\n` + fragment indented at 6 spaces.
    const fragment = dumpFragment([project], 6)
    const before = lines.slice(0, inlineEmptyIdx).join('\n')
    const after = lines.slice(inlineEmptyIdx + 1).join('\n')
    const sep = before.endsWith('\n') ? '' : '\n'
    const afterSep = after.length > 0 && !after.startsWith('\n') ? '\n' : ''
    const replaced = `${before}${sep}    projects:\n${fragment.replace(/\n$/, '')}${afterSep}${after}`
    return replaced.replace(/\n*$/, '\n')
  }

  if (lastProjectStartIdx < 0) {
    throw new MalformedYamlError(
      projectsKeyIdx < 0
        ? `client "${clientSlug}" has no "projects:" section — add one manually or recreate the client`
        : `client "${clientSlug}" projects: section has no entries at the expected 6-space indent`,
    )
  }

  // Append before endIdx (next client or EOF). The existing structure already
  // formats projects at 6-space indent for `- slug:`.
  const fragment = dumpFragment([project], 6)
  const before = lines.slice(0, endIdx).join('\n')
  const after = lines.slice(endIdx).join('\n')
  const sep = before.endsWith('\n') ? '' : '\n'
  const afterSep = after.length > 0 && !after.startsWith('\n') ? '\n' : ''
  const next = `${before}${sep}${fragment.replace(/\n$/, '')}${afterSep}${after}`
  return next.replace(/\n*$/, '\n')
}

interface RoundTripExpectations {
  newClientSlug?: string
  newProjectForClient?: { clientSlug: string; projectSlug: string }
  removedClientSlug?: string
  removedProjectForClient?: { clientSlug: string; projectSlug: string }
}

function validateRoundTrip(
  nextText: string,
  prev: ClientsFile,
  expect: RoundTripExpectations,
): void {
  let next: ClientsFile
  try {
    next = yaml.load(nextText) as ClientsFile
  } catch (err) {
    throw new MalformedYamlError(`spliced YAML is not parseable: ${(err as Error).message}`)
  }
  if (!next || !Array.isArray(next.clients)) {
    throw new MalformedYamlError('spliced YAML lost the top-level clients: array')
  }
  const prevSlugs = new Set(prev.clients.map(c => c.slug))
  const nextSlugs = new Set(next.clients.map(c => c.slug))

  // For add operations: every prior client must survive.
  // For remove operations: every prior client EXCEPT the one being removed must survive.
  for (const s of prevSlugs) {
    if (expect.removedClientSlug === s) continue
    if (!nextSlugs.has(s)) {
      throw new MalformedYamlError(`spliced YAML dropped existing client "${s}"`)
    }
  }
  if (expect.newClientSlug && !nextSlugs.has(expect.newClientSlug)) {
    throw new MalformedYamlError(`new client "${expect.newClientSlug}" missing from spliced YAML`)
  }
  if (expect.removedClientSlug && nextSlugs.has(expect.removedClientSlug)) {
    throw new MalformedYamlError(`removed client "${expect.removedClientSlug}" still present after splice`)
  }
  if (expect.newProjectForClient) {
    const { clientSlug, projectSlug } = expect.newProjectForClient
    const found = next.clients
      .find(c => c.slug === clientSlug)
      ?.projects.some(p => p.slug === projectSlug)
    if (!found) {
      throw new MalformedYamlError(
        `new project "${projectSlug}" missing under client "${clientSlug}" after splice`,
      )
    }
  }
  if (expect.removedProjectForClient) {
    const { clientSlug, projectSlug } = expect.removedProjectForClient
    const stillThere = next.clients
      .find(c => c.slug === clientSlug)
      ?.projects.some(p => p.slug === projectSlug)
    if (stillThere) {
      throw new MalformedYamlError(
        `removed project "${projectSlug}" still present under "${clientSlug}" after splice`,
      )
    }
    // Also ensure all OTHER projects under that client survived.
    const prevClient = prev.clients.find(c => c.slug === clientSlug)
    const nextClient = next.clients.find(c => c.slug === clientSlug)
    if (prevClient && nextClient) {
      for (const p of prevClient.projects) {
        if (p.slug === projectSlug) continue
        if (!nextClient.projects.some(np => np.slug === p.slug)) {
          throw new MalformedYamlError(
            `splice dropped sibling project "${p.slug}" while removing "${projectSlug}"`,
          )
        }
      }
    }
  }
}

// ---- delete mutations ----

export async function removeClient(clientSlug: string): Promise<void> {
  assertValidSlug(clientSlug, 'client')
  const { text, parsed } = await readClientsText()
  if (!parsed.clients.some(c => c.slug === clientSlug)) {
    throw new ClientNotFoundError(clientSlug)
  }

  // Find the client's line range: from `  - slug: <slug>` to (next `  - slug:` OR EOF).
  // Delete that range, preserving all surrounding text (including blank lines and any
  // comments that aren't part of this client's block).
  const lines = text.split('\n')
  const targetRe = new RegExp(`^  - slug: ${escapeRegex(clientSlug)}(\\s|$)`)
  const siblingRe = /^  - slug: /

  let startIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (targetRe.test(lines[i])) {
      startIdx = i
      break
    }
  }
  if (startIdx < 0) {
    throw new MalformedYamlError(`could not locate "- slug: ${clientSlug}" at the expected 2-space indent`)
  }

  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (siblingRe.test(lines[i])) {
      endIdx = i
      break
    }
  }

  const before = lines.slice(0, startIdx)
  const after = lines.slice(endIdx)
  let nextText = collapseBlankRuns([...before, ...after].join('\n')).replace(/\n*$/, '\n')

  // If we just removed the last client, the top-level `clients:` key is left
  // dangling (yaml.load parses as null, breaking our typed loader). Collapse
  // to `clients: []` so the file remains a valid ClientsFile.
  nextText = normalizeEmptyClientsBlock(nextText)

  validateRoundTrip(nextText, parsed, { removedClientSlug: clientSlug })
  await atomicWriteYaml(nextText)
  invalidateClientsCache()
}

function normalizeEmptyClientsBlock(text: string): string {
  const lines = text.split('\n')
  const clientsKeyRe = /^clients:\s*$/
  const clientEntryRe = /^  - slug: /
  let keyIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (clientsKeyRe.test(lines[i])) { keyIdx = i; break }
  }
  if (keyIdx < 0) return text
  for (let i = keyIdx + 1; i < lines.length; i++) {
    if (clientEntryRe.test(lines[i])) return text  // has entries, leave alone
  }
  lines[keyIdx] = 'clients: []'
  return lines.join('\n')
}

export async function removeProject(clientSlug: string, projectSlug: string): Promise<void> {
  assertValidSlug(clientSlug, 'client')
  assertValidSlug(projectSlug, 'project')
  const { text, parsed } = await readClientsText()
  const client = parsed.clients.find(c => c.slug === clientSlug)
  if (!client) throw new ClientNotFoundError(clientSlug)
  if (!client.projects.some(p => p.slug === projectSlug)) {
    throw new ClientNotFoundError(`project "${projectSlug}" under "${clientSlug}"`)
  }

  const lines = text.split('\n')
  const clientLineRe = new RegExp(`^  - slug: ${escapeRegex(clientSlug)}(\\s|$)`)
  const nextClientRe = /^  - slug: /
  const targetProjectRe = new RegExp(`^      - slug: ${escapeRegex(projectSlug)}(\\s|$)`)
  const projectEntryRe = /^      - slug: /

  let clientStartIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (clientLineRe.test(lines[i])) {
      clientStartIdx = i
      break
    }
  }
  if (clientStartIdx < 0) {
    throw new MalformedYamlError(`could not locate client "${clientSlug}" in source text`)
  }
  let clientEndIdx = lines.length
  for (let i = clientStartIdx + 1; i < lines.length; i++) {
    if (nextClientRe.test(lines[i])) {
      clientEndIdx = i
      break
    }
  }

  let projStartIdx = -1
  for (let i = clientStartIdx + 1; i < clientEndIdx; i++) {
    if (targetProjectRe.test(lines[i])) {
      projStartIdx = i
      break
    }
  }
  if (projStartIdx < 0) {
    throw new MalformedYamlError(
      `could not locate "- slug: ${projectSlug}" inside client "${clientSlug}"`,
    )
  }
  let projEndIdx = clientEndIdx
  for (let i = projStartIdx + 1; i < clientEndIdx; i++) {
    if (projectEntryRe.test(lines[i])) {
      projEndIdx = i
      break
    }
  }

  const before = lines.slice(0, projStartIdx)
  const after = lines.slice(projEndIdx)
  let nextText = collapseBlankRuns([...before, ...after].join('\n')).replace(/\n*$/, '\n')

  // If we just removed the last project under this client, the projects: key
  // is left dangling (yaml.load would parse it as null, breaking our types).
  // Detect "projects:" followed by no project entries inside this client and
  // collapse it to "projects: []".
  nextText = normalizeEmptyProjectsBlock(nextText, clientSlug)

  validateRoundTrip(nextText, parsed, {
    removedProjectForClient: { clientSlug, projectSlug },
  })
  await atomicWriteYaml(nextText)
  invalidateClientsCache()
}

// If a client's projects: key has zero entries after a delete, rewrite it as
// `projects: []` so it stays a valid (typed-as-Project[]) array.
function normalizeEmptyProjectsBlock(text: string, clientSlug: string): string {
  const lines = text.split('\n')
  const clientLineRe = new RegExp(`^  - slug: ${escapeRegex(clientSlug)}(\\s|$)`)
  const nextClientRe = /^  - slug: /
  const projectsKeyRe = /^    projects:\s*$/
  const projectEntryRe = /^      - slug: /

  let start = -1
  for (let i = 0; i < lines.length; i++) {
    if (clientLineRe.test(lines[i])) { start = i; break }
  }
  if (start < 0) return text
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (nextClientRe.test(lines[i])) { end = i; break }
  }
  let projKeyIdx = -1
  for (let i = start + 1; i < end; i++) {
    if (projectsKeyRe.test(lines[i])) { projKeyIdx = i; break }
  }
  if (projKeyIdx < 0) return text
  for (let i = projKeyIdx + 1; i < end; i++) {
    if (projectEntryRe.test(lines[i])) return text  // has entries, no change
  }
  lines[projKeyIdx] = '    projects: []'
  return lines.join('\n')
}

// Collapse 3+ consecutive blank lines down to 2 so a deletion doesn't leave a
// gaping hole. We allow 2 blanks to preserve intentional section separators
// the file already uses.
function collapseBlankRuns(text: string): string {
  return text.replace(/\n{4,}/g, '\n\n\n')
}

// Re-export this for routes that want to break the cache after a mutation
// that didn't originate here (e.g. external file edits).
export { invalidateClientsCache }
