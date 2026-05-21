#!/usr/bin/env bash
# Fake `claude` for 04-07 calendar-context tests. Emits stream-json text-delta
# events that aggregate to a Markdown bullet list of calendar events.
#
# Modes (CALENDAR_FAKE_MODE env or token in args):
#  - default: emits a small bullet list, exit 0.
#  - --fail:  emits stderr "simulated calendar failure", exit 2.
#  - --slow:  sleeps 5s then emits one delta. Used for timeout testing.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
SLOW=false
case "${CALENDAR_FAKE_MODE:-}" in
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
  echo "simulated calendar failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 5
  emit_delta '"- slow event"'
  exit 0
fi

echo '{"type":"system","subtype":"hook_started"}'
emit_delta '"- Kickoff sync — 2026-05-22T15:00:00Z → 2026-05-22T15:30:00Z — attendees: meghan@example.com — link: https://meet.example/abc\n"'
emit_delta '"- Walk-through — 2026-05-23T18:00:00Z → 2026-05-23T19:00:00Z — attendees: aaron@example.com — link: (none)\n"'
echo '{"type":"result","subtype":"success","result":"final"}'
