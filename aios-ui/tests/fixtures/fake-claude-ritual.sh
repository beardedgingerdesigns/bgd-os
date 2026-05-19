#!/usr/bin/env bash
# Fake `claude` for v3 ritual tests. Echoes the ritual slug in its output so
# tests can verify slug → command routing. --fail / --slow behave like other
# fixtures.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
SLOW=false
COMMAND=""
for arg in "$@"; do
  case "$arg" in
    --fail) FAIL=true ;;
    --slow) SLOW=true ;;
    /level-up|/weekly-project-status|/audit) COMMAND="$arg" ;;
  esac
done

if $FAIL; then
  echo "simulated ritual failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 3
fi

emit_delta "\"Ran ${COMMAND}.\""
emit_delta '"\n\nRitual complete."'
