#!/usr/bin/env python3
"""Extract Justin's real user messages from Claude Code JSONL session history.

Used by /retro. Filters out sidechains (subagent transcripts), meta lines,
tool results, command/hook noise, and system reminders — leaving only what
Justin actually typed or dictated, grouped by session, chronological.

Usage: python3 scripts/retro-extract.py [days_back] [out_dir]
Defaults: 7 days, /tmp/retro
"""
import json, os, glob, time, re, sys

days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
out_dir = sys.argv[2] if len(sys.argv) > 2 else "/tmp/retro"
os.makedirs(out_dir, exist_ok=True)

root = os.path.expanduser("~/.claude/projects")
cutoff = time.time() - days * 86400
SKIP_PREFIXES = ("<command-name>", "<local-command-stdout>", "Caveat:",
                 "<system-reminder>", "[Request interrupted")
stats = {}

for d in sorted(glob.glob(root + "/*/")):
    proj = (os.path.basename(d.rstrip("/"))
            .replace("-Users-justinlobaito", "~").replace("-repos-", "repos/"))
    out_lines = []
    for f in sorted(glob.glob(d + "*.jsonl")):
        if os.path.getmtime(f) < cutoff:
            continue
        sess_lines = []
        try:
            for line in open(f, encoding="utf-8", errors="ignore"):
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if rec.get("type") != "user": continue
                if rec.get("isSidechain"): continue
                if rec.get("isMeta"): continue
                if rec.get("userType") not in (None, "external"): continue
                c = rec.get("message", {}).get("content")
                texts = ([c] if isinstance(c, str) else
                         [i.get("text", "") for i in c
                          if isinstance(i, dict) and i.get("type") == "text"]
                         if isinstance(c, list) else [])
                for t in texts:
                    t = t.strip()
                    if not t or t.startswith(SKIP_PREFIXES): continue
                    t = re.sub(r"<system-reminder>.*?</system-reminder>", "",
                               t, flags=re.S).strip()
                    if not t: continue
                    ts = (rec.get("timestamp") or "")[:16]
                    sess_lines.append(f"[{ts}] {t[:400]}")
        except OSError:
            continue
        if sess_lines:
            out_lines.append(f"\n=== session {os.path.basename(f)[:8]} ({len(sess_lines)} msgs) ===")
            out_lines.extend(sess_lines)
    if out_lines:
        fn = os.path.join(out_dir, proj.replace("/", "_").replace("~", "home") + ".txt")
        open(fn, "w").write("\n".join(out_lines))
        stats[proj] = (sum(1 for l in out_lines if l.startswith("[")),
                       os.path.getsize(fn) // 1024)

for p, (n, kb) in sorted(stats.items(), key=lambda x: -x[1][0]):
    print(f"{n:5d} msgs  {kb:5d}KB  {p}")
print("TOTAL:", sum(n for n, _ in stats.values()), "user messages ->", out_dir)
