#!/usr/bin/env bash
# Fake `claude` for wiki-ingest tests.
# Modes (last arg before the prompt string, or detected via prompt content):
#   default (no special args): emits text deltas including an INGEST_SUMMARY block
#                              with 2 promoted, 1 deferred, 0 contested. Exits 0.
#   --no-summary:              emits text deltas but NO INGEST_SUMMARY markers. Exits 0.
#   --fail:                    emits stderr "simulated failure", exits 1.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
NO_SUMMARY=false

for arg in "$@"; do
  case "$arg" in
    --fail) FAIL=true ;;
    --no-summary) NO_SUMMARY=true ;;
  esac
done

if $FAIL; then
  echo "simulated ingest failure" >&2
  exit 1
fi

emit_delta '"Ingesting wiki drops...\n"'
emit_delta '"Processing capture-2026-05-21-meghan-handoff.md...\n"'
emit_delta '"Processing chat-decision-2026-05-21-pricing.md...\n"'
emit_delta '"Deferred: capture-2026-05-20-rough-notes.md (insufficient context)\n"'
emit_delta '"Ingest pass complete.\n"'

if ! $NO_SUMMARY; then
  emit_delta '"<!-- INGEST_SUMMARY_START -->\n"'
  emit_delta '"```json\n"'
  emit_delta '"{\n  \"promoted\": [\"capture-2026-05-21-meghan-handoff.md\", \"chat-decision-2026-05-21-pricing.md\"],\n  \"deferred\": [\"capture-2026-05-20-rough-notes.md\"],\n  \"contested\": []\n}\n"'
  emit_delta '"```\n"'
  emit_delta '"<!-- INGEST_SUMMARY_END -->\n"'
fi
