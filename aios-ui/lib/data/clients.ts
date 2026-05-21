import fs from 'fs/promises'
import yaml from 'js-yaml'
import { CLIENTS_YAML_PATH } from '@/lib/paths'
import type { Client, ClientsFile, Project } from '@/lib/types'

let cache: { clients: Client[]; mtime: number } | null = null

async function readAndParse(): Promise<Client[]> {
  const stat = await fs.stat(CLIENTS_YAML_PATH)
  if (cache && cache.mtime === stat.mtimeMs) {
    return cache.clients
  }
  const text = await fs.readFile(CLIENTS_YAML_PATH, 'utf-8')
  const parsed = yaml.load(text) as ClientsFile
  if (!parsed || !Array.isArray(parsed.clients)) {
    throw new Error(`Malformed clients.yaml at ${CLIENTS_YAML_PATH}`)
  }
  cache = { clients: parsed.clients, mtime: stat.mtimeMs }
  return cache.clients
}

export async function loadClients(): Promise<Client[]> {
  return readAndParse()
}

export async function getClient(slug: string): Promise<Client | undefined> {
  const clients = await loadClients()
  return clients.find(c => c.slug === slug)
}

export async function getProject(
  clientSlug: string,
  projectSlug: string
): Promise<Project | undefined> {
  const client = await getClient(clientSlug)
  return client?.projects.find(p => p.slug === projectSlug)
}

// Used by clients-mutations.ts after a write to force the next loadClients()
// call to re-read from disk. The mtime check would catch it on the next call,
// but writing through atomic temp+rename can produce identical mtime values
// in fast sequences; explicit invalidation is the safer contract.
export function invalidate(): void {
  cache = null
}
