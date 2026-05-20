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
    return JSON.parse(raw) as ChatSessionsFile
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { sessions: {} }
    throw err
  }
}

async function writeFile(file: ChatSessionsFile): Promise<void> {
  await fs.mkdir(cacheDir(), { recursive: true })
  await fs.writeFile(sessionsFilePath(), JSON.stringify(file, null, 2), 'utf-8')
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
