#!/usr/bin/env bash
# Fake `claude` for 04-07 gmail-context tests. Emits stream-json text-delta
# events that aggregate to a Markdown table of Gmail threads. The aggregated
# text is what fetchGmailContext returns as its resolved string.
#
# Modes (triggered by extra flags appended into the prompt or via env):
#  - default: emits a small table row, exit 0.
#  - --fail:  emits stderr "simulated gmail failure", exit 2.
#  - --slow:  sleeps 5s then emits one delta. Used for timeout testing.
#
# NOTE: claude actually parses the prompt for arg-like tokens; we cheat by
# looking at GMAIL_FAKE_MODE env, which the test sets explicitly. Falls back
# to scanning $@ for --fail / --slow tokens to match the build-brief pattern.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
SLOW=false
case "${GMAIL_FAKE_MODE:-}" in
  fail) FAIL=true ;;
  slow) SLOW=true ;;
esac
for arg in "$@"; do
  case "$arg" in
    *--fail*) FAIL=true ;;
    *--slow*) SLOW=true ;;
  esac
done

if $FAIL; then
  echo "simulated gmail failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 5
  emit_delta '"| slow | row | row | row | row |"'
  exit 0
fi

echo '{"type":"system","subtype":"hook_started"}'
emit_delta '"| Thread ID | Subject | Last sender | Last message | Summary |\n"'
emit_delta '"|---|---|---|---|---|\n"'
emit_delta '"| t1 | Subject A | meghan | 2026-05-20T10:00:00Z | greeting |\n"'
echo '{"type":"result","subtype":"success","result":"final"}'
