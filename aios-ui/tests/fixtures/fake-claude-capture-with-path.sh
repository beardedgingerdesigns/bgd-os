#!/usr/bin/env bash
# Fake `claude` for v3 capture tests where the subprocess emits a parseable
# absolute file path in its stream. Used to exercise the runCapture multi-regex
# path extractor + receipt-emission branch (HUB-06).
#
# Flags:
#   --no-path    emit a success message that contains NO absolute .md path
#                (so the multi-regex SKIPS receipt emission per HUB-06).
#   --emit-path=<absolute_path>  override the default emitted path. Useful for
#                tests that compare against a specific tmpdir target.
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}}\n' "$1"
}

NO_PATH=false
EMITTED_PATH="/Users/justinlobaito/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/feedback_capture_subprocess.md"
for arg in "$@"; do
  case "$arg" in
    --no-path) NO_PATH=true ;;
    --emit-path=*) EMITTED_PATH="${arg#--emit-path=}" ;;
  esac
done

if $NO_PATH; then
  # Success but the operator output has NO absolute .md path inside it. HUB-06
  # requires the receipt to be SKIPPED here (don't emit one with empty
  # file_written).
  emit_delta '"ok, captured to memory (no path surfaced)"'
  exit 0
fi

# Build a delta string that the runCapture multi-regex MUST be able to parse.
# Pattern R1: /(?:Wrote|Created|Saved)\s+(?:.*?\s+(?:to|:)\s+)?(\/[^\s'"\`]+\.md)/i
emit_delta "\"Wrote capture to ${EMITTED_PATH}\""
