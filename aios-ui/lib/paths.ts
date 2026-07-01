// aios-ui/lib/paths.ts
import path from 'path'
import os from 'os'

const DEFAULT_CLAUDE_OS_ROOT = '/Users/justinlobaito/repos/claude-os'
const DEFAULT_MEMORY_ROOT = path.join(
  os.homedir(),
  '.claude/projects/-Users-justinlobaito-repos-claude-os/memory'
)

export const CLAUDE_OS_ROOT = process.env.CLAUDE_OS_ROOT ?? DEFAULT_CLAUDE_OS_ROOT
export const MEMORY_ROOT = process.env.MEMORY_ROOT ?? DEFAULT_MEMORY_ROOT

export const CLIENTS_YAML_PATH = path.join(CLAUDE_OS_ROOT, 'clients.yaml')
export const DECISIONS_LOG_PATH = path.join(CLAUDE_OS_ROOT, 'decisions/log.md')
export const REFERENCES_DIR = path.join(CLAUDE_OS_ROOT, 'references')
export const TODOS_PENDING_PATH = path.join(CLAUDE_OS_ROOT, 'todos/pending.md')
export const TODOS_COMPLETED_PATH = path.join(CLAUDE_OS_ROOT, 'todos/completed.md')
export const TODOS_ACTIVITY_PATH = path.join(CLAUDE_OS_ROOT, 'todos/activity.md')
export const STATE_DIR = path.join(CLAUDE_OS_ROOT, 'state')
