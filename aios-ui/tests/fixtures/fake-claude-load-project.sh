#!/usr/bin/env bash
# Fake `claude` for 04-06 build-brief tests. Emits stream-json text-delta
# events that aggregate to a /load-project style brief. The aggregated text
# is what build-brief.ts writes to .aios-cache/briefs/<slug>.md.
#
# Modes (triggered by extra flags appended after the slash command):
#  - default: emits a small brief, exit 0.
#  - --fail:  emits stderr "simulated load-project failure", exit 2.
#  - --slow:  sleeps 5s then emits one delta. Used for timeout testing.
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
  echo "simulated load-project failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 5
  emit_delta '"slow brief"'
  exit 0
fi

# Noise event the parser must ignore.
echo '{"type":"system","subtype":"hook_started"}'
emit_delta '"## Project: Inside Out\n"'
emit_delta '"Hello from /load-project subprocess."'
echo '{"type":"result","subtype":"success","result":"final"}'
