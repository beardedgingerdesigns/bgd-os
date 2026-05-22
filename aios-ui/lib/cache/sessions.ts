// Phase 04 review WR-01: sessions.json read-modify-write was non-atomic.
// Switched to the temp+rename pattern already used in triage-overrides.ts so
// fs.writeFile's open→truncate→write cannot leave a half-written file on
// crash, and added a JSON.parse try/catch that recovers to an empty sessions
// map if a prior half-write somehow slipped through. A serialized mutex on
// the in-flight reads + writes is out of scope here — the lost-update race
// between two near-simultaneous tabs still exists but is rare in practice
// (Justin is single-operator) and the corruption-recovery branch ensures the
// next read won't fault.
import fs from 'fs/promises'
import path from 'path'
import type { ChatSession, ChatSessionsFile } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function sessionsFilePath(): string {
  return path.join(cacheDir(), 'sessions.json')
}

function sessionKey(clientSlug: string, projectSlug: string): string {
  return `${clientSlug}/${projectSlug}`
}

async function readFile(): Promise<ChatSessionsFile> {
  try {
    const raw = await fs.readFile(sessionsFilePath(), 'utf-8')
    try {
      return JSON.parse(raw) as ChatSessionsFile
    } catch {
      // Half-written file from a prior crash. Recover by treating it as empty
      // so the chat surfaces don't fault. The next write will overwrite it
      // atomically.
      // eslint-disable-next-line no-console
      console.warn('[sessions] sessions.json was unparseable — recovering as empty')
      return { sessions: {} }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { sessions: {} }
    throw err
  }
}

async function writeFile(file: ChatSessionsFile): Promise<void> {
  await fs.mkdir(cacheDir(), { recursive: true })
  const finalPath = sessionsFilePath()
  const tmpPath = `${finalPath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(file, null, 2), 'utf-8')
  try {
    await fs.rename(tmpPath, finalPath)
  } catch (err) {
    // Best-effort cleanup: if rename failed, drop the half-written tmp.
    await fs.unlink(tmpPath).catch(() => {})
    throw err
  }
}

export async function readChatSession(
  clientSlug: string,
  projectSlug: string,
): Promise<ChatSession | null> {
  const file = await readFile()
  return file.sessions[sessionKey(clientSlug, projectSlug)] ?? null
}

export async function writeChatSession(session: ChatSession): Promise<void> {
  const file = await readFile()
  file.sessions[sessionKey(session.clientSlug, session.projectSlug)] = session
  await writeFile(file)
}

export async function deleteChatSession(
  clientSlug: string,
  projectSlug: string,
): Promise<void> {
  const file = await readFile()
  delete file.sessions[sessionKey(clientSlug, projectSlug)]
  await writeFile(file)
}
