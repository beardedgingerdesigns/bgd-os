#!/usr/bin/env bash
# Fake `claude` for tests. Emits stream-json with text-delta events so the
# parser in lib/skills/daily-ingest.ts can extract content.
#
# - default invocation: emits a few text-delta lines plus noise events the
#   parser should ignore; aggregated text contains "Inbox Triage". Exit 0.
# - --fail: emits stderr "simulated failure", exits 2.
# - --slow: sleeps 3 seconds then emits one text-delta, exits 0.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

emit_noise() {
  # Events the parser must IGNORE: system hooks, content_block_start, result wrapper.
  echo '{"type":"system","subtype":"hook_started"}'
  echo '{"type":"stream_event","event":{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}}'
}

case "$1" in
  --fail)
    echo "simulated failure" >&2
    exit 2
    ;;
  --slow)
    sleep 3
    emit_delta '"# Inbox Triage (slow)\n"'
    ;;
  *)
    emit_noise
    emit_delta '"# Inbox Triage"'
    emit_delta '" — 2026-05-19\n\n"'
    emit_delta '"**1 thread needs reply today.**\n"'
    echo '{"type":"result","subtype":"success","result":"final"}'
    ;;
esac
