#!/usr/bin/env bash
# Fake `claude` for tests. Echoes a fixed triage output, exits 0.
# If the first arg is "--fail", exits 2 with stderr "simulated failure".
# If the first arg is "--slow", sleeps 3 seconds before echoing.
set -e
case "$1" in
  --fail)
    echo "simulated failure" >&2
    exit 2
    ;;
  --slow)
    sleep 3
    echo "# Inbox Triage (slow)"
    echo ""
    echo "Done."
    ;;
  *)
    echo "# Inbox Triage — 2026-05-19"
    echo ""
    echo "**1 thread needs reply today.**"
    ;;
esac
