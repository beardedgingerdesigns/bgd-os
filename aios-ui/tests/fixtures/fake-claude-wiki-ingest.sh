#!/usr/bin/env bash
# Fake `claude` for wiki-ingest tests.
# Modes (last arg before the prompt string, or detected via prompt content):
#   default (no special args): emits text deltas including an INGEST_SUMMARY block
#                              with 2 promoted, 1 deferred, 0 contested. Exits 0.
#   --no-summary:              emits text deltas but NO INGEST_SUMMARY markers. Exits 0.
#   --fail:                    emits stderr "simulated failure", exits 1.
#   --rich-summary:            emits a summary with rich ContestedEntry + SkippedEntry objects. Exits 0.
#   --legacy-contested:        emits a summary with contested as plain strings (legacy format). Exits 0.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

FAIL=false
NO_SUMMARY=false
RICH_SUMMARY=false
LEGACY_CONTESTED=false

for arg in "$@"; do
  case "$arg" in
    --fail) FAIL=true ;;
    --no-summary) NO_SUMMARY=true ;;
    --rich-summary) RICH_SUMMARY=true ;;
    --legacy-contested) LEGACY_CONTESTED=true ;;
  esac
done

if $FAIL; then
  echo "simulated ingest failure" >&2
  exit 1
fi

emit_delta '"Ingesting wiki drops...\n"'
emit_delta '"Processing captures...\n"'
emit_delta '"Ingest pass complete.\n"'

if $RICH_SUMMARY; then
  emit_delta '"<!-- INGEST_SUMMARY_START -->\n"'
  emit_delta '"```json\n"'
  emit_delta '"{\n  \"promoted\": [\"capture-2026-06-04-thermal-kitchen-launch.md\"],\n  \"deferred\": [],\n  \"skipped\": [\n    { \"file\": \"capture-2026-06-04-status-check.md\", \"reason\": \"Content fully covered by existing wiki/overview.md\" }\n  ],\n  \"contested\": [\n    {\n      \"file\": \"chat-decision-2026-06-04-launch-shifted.md\",\n      \"contradiction\": {\n        \"incoming_claim\": \"Launch date moved to July 15\",\n        \"existing_claim\": \"Launch date is June 16\",\n        \"existing_page\": \"wiki/pages/timeline.md\",\n        \"severity\": \"high\"\n      }\n    }\n  ]\n}\n"'
  emit_delta '"```\n"'
  emit_delta '"<!-- INGEST_SUMMARY_END -->\n"'
elif $LEGACY_CONTESTED; then
  emit_delta '"<!-- INGEST_SUMMARY_START -->\n"'
  emit_delta '"```json\n"'
  emit_delta '"{\n  \"promoted\": [],\n  \"deferred\": [],\n  \"contested\": [\"some-file.md\"]\n}\n"'
  emit_delta '"```\n"'
  emit_delta '"<!-- INGEST_SUMMARY_END -->\n"'
elif ! $NO_SUMMARY; then
  emit_delta '"<!-- INGEST_SUMMARY_START -->\n"'
  emit_delta '"```json\n"'
  emit_delta '"{\n  \"promoted\": [\"capture-2026-05-21-meghan-handoff.md\", \"chat-decision-2026-05-21-pricing.md\"],\n  \"deferred\": [\"capture-2026-05-20-rough-notes.md\"],\n  \"contested\": []\n}\n"'
  emit_delta '"```\n"'
  emit_delta '"<!-- INGEST_SUMMARY_END -->\n"'
fi
