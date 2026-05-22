import { spawn } from 'child_process'

/**
 * Spawn a `claude --print` subprocess that summarises upcoming Google Calendar
 * events whose attendees overlap the project's contacts. Aggregates stream-json
 * text deltas and returns the resulting markdown bullet list. ADR 0005: live
 * context is fetched at chat bootstrap, not embedded in the static brief.
 *
 * Failure policy: timeout, non-zero exit, or spawn error all resolve to ''. The
 * caller (chat-bootstrap) treats '' as "no upcoming events." so the chat still
 * loads even when MCP is offline or the subprocess hangs.
 */

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_DAYS_FORWARD = 7

export interface CalendarContextOpts {
  projectName: string
  contacts: string[]
  daysForward?: number
  claudeBin?: string
  timeoutMs?: number
  /** Test seam — extra env vars passed to the spawned subprocess. */
  envOverride?: Record<string, string>
}

function extractTextDelta(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  if (obj.type !== 'stream_event') return null
  const event = obj.event as Record<string, unknown> | undefined
  if (!event || event.type !== 'content_block_delta') return null
  const delta = event.delta as Record<string, unknown> | undefined
  if (!delta || delta.type !== 'text_delta') return null
  const text = delta.text
  return typeof text === 'string' ? text : null
}

export async function fetchCalendarContext(opts: CalendarContextOpts): Promise<string> {
  const daysForward = opts.daysForward ?? DEFAULT_DAYS_FORWARD
  const claudeBin = opts.claudeBin ?? 'claude'
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const contactList =
    opts.contacts.length === 0
      ? '(no contacts on file)'
      : opts.contacts.join(', ')

  const prompt = [
    `Search Google Calendar for events from now through the next ${daysForward} days.`,
    `Filter to events whose attendees overlap any of: ${contactList}.`,
    `For each event, return one Markdown bullet: '- {title} — {start ISO} → {end ISO} — attendees: {…} — link: {meeting URL if present}'.`,
    `If none, return exactly: "No upcoming calendar events for ${opts.projectName}."`,
  ].join(' ')

  const args = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    prompt,
  ]

  return new Promise<string>(resolve => {
    let lineBuffer = ''
    let aggregated = ''
    let settled = false

    const child = spawn(claudeBin, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: opts.envOverride ? { ...process.env, ...opts.envOverride } : process.env,
    })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try { child.kill('SIGKILL') } catch { /* already exited */ }
      resolve('')
    }, timeoutMs)

    child.stdout.on('data', d => {
      lineBuffer += d.toString()
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''
      for (const line of lines) {
        const delta = extractTextDelta(line)
        if (delta !== null) aggregated += delta
      }
    })

    // Drain stderr so the OS pipe buffer (~64 KB) cannot fill and deadlock
    // the child. We don't surface subprocess stderr from context helpers —
    // failures resolve to '' — but we must consume the bytes. Matches the
    // pattern in daily-ingest.ts:96-98, capture.ts, wiki-ingest.ts,
    // build-brief.ts. (Phase 04 review CR-01.)
    child.stderr.on('data', () => {
      // Intentionally empty: drain only.
    })

    child.on('error', () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve('')
    })

    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (lineBuffer.trim()) {
        const delta = extractTextDelta(lineBuffer)
        if (delta !== null) aggregated += delta
      }
      if (code === 0) {
        resolve(aggregated)
      } else {
        resolve('')
      }
    })
  })
}
