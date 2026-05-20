#!/usr/bin/env bash
# Fake `claude` for v2 chat tests. Emits stream-json that includes a session_id.
# Mode is determined by presence of --resume:
#  - default (no --resume): "load" mode — emits text deltas that aggregate to
#    a brief, includes session_id "sess_loaded_xyz".
#  - --resume <id>: "message" mode — emits text deltas that aggregate to a
#    reply, includes the same session_id passed via --resume.
# --fail or --slow take precedence (same as v1 fixture).
set -e

emit_delta() {
  printf '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}},"session_id":"%s"}\n' "$1" "$2"
}

emit_meta() {
  printf '{"type":"system","subtype":"hook_started","session_id":"%s"}\n' "$1"
}

# Parse args for --fail/--slow/--resume
RESUME_ID=""
FAIL=false
SLOW=false
for arg in "$@"; do
  case "$arg" in
    --fail) FAIL=true ;;
    --slow) SLOW=true ;;
  esac
done
# Find --resume value
prev=""
for arg in "$@"; do
  if [ "$prev" = "--resume" ]; then
    RESUME_ID="$arg"
    break
  fi
  prev="$arg"
done

if $FAIL; then
  echo "simulated failure" >&2
  exit 2
fi

if $SLOW; then
  sleep 3
  emit_delta '"slow."' "sess_loaded_xyz"
  exit 0
fi

if [ -n "$RESUME_ID" ]; then
  # Message mode — preserve the session id passed in.
  emit_meta "$RESUME_ID"
  emit_delta '"Got it. "' "$RESUME_ID"
  emit_delta '"Here is my reply."' "$RESUME_ID"
else
  # Load mode — emit a brief and a session id.
  emit_meta "sess_loaded_xyz"
  emit_delta '"# Loaded\n"' "sess_loaded_xyz"
  emit_delta '"Project context attached."' "sess_loaded_xyz"
fi
