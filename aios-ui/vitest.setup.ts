import path from 'path'

// Point the data layer at the test fixture filesystem so tests are hermetic.
const fixtureRoot = path.resolve(__dirname, 'tests/fixtures')
process.env.CLAUDE_OS_ROOT = path.join(fixtureRoot, 'claude-os')
process.env.MEMORY_ROOT = path.join(fixtureRoot, 'memory')
