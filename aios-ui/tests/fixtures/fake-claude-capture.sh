#!/usr/bin/env bash
# Fake `claude` for v3 capture tests. Reads /capture <text> from args and emits
# stream-json text deltas confirming the routing. Behaviors triggered by special
# arg flags: --fail emits stderr + exit 2. --slow sleeps then emits.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
SLOW=false
for arg in "$@"; do
  case "$arg" in
    --fail) FAIL=true ;;
    --slow) SLOW=true ;;
  esac
done

if $FAIL; then
  echo "simulated capture failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 3
fi

emit_delta '"Captured to memory: "'
emit_delta '"feedback_capture_test"'
