---
client: deploy-answers
project: brand
type: brief
---
# Creative Director Brief — Deploy Answers brand identity

Self-contained handoff for a creative-director (CD) agent. Hands over the brand decisions
locked in Justin's grill-me session (2026-06-01) as hard constraints, and names exactly which
calls are the CD's to make. Companion to `references/deploy-answers.md` (the venture itself).

## Your role
You are the creative director making the final identity calls for **Deploy Answers**. This
brief gives you locked brand decisions as hard constraints and names exactly which calls are
yours. **On your first pass, diverge:** present multiple distinct options for the open calls so
the founder can choose before you refine. Do not deliver a single polished answer on pass one.

## What Deploy Answers is
- A Texas LLC operating as a **crafted-technical studio**. Three principals: Nel Santiago
  (creative agency / video — Forbidden Sky), Alex Sdoucos (film exec / commercial — Doozy
  Films), Justin Lobaito (product / design / full-stack — Bearded Ginger Designs).
- It ships **software + solutions for video creators and teams.** Not generic dev-tools SaaS;
  not a pure creative agency. The differentiator: **video people who actually ship real software.**
- Products under the umbrella, each keeping its **own** brand: **Backup Bison** (Vimeo backup
  utility), **Clappy** (video editing tool).

## LOCKED — do not change

**Brand architecture — endorsed parent, own identity.** Deploy Answers has its OWN look, not a
recolor of any product. Design a compact **endorsement stamp** ("A Deploy Answers product") plus
a favicon/avatar as part of the mark system, since the parent will appear on product surfaces.

**Personality — crafted-technical studio.** Confident, precise, modern. Design polish WITH
engineering credibility. Subtle precision/deploy cues; a mono accent. NOT cold-terminal, NOT
playful, NOT generic SaaS. Tone words: confident, precise, crafted, technically credible,
quietly premium.

**Palette model — monochrome + ONE electric accent.** Type does the work; color is used
sparingly.
- Accent = warm **signal coral**, starting point `#FF5436` (final value is yours — see open calls).
- Neutrals = near-black ink (~`#0E0E10`) + off-white (~`#FAFAFA`) + a grey ramp. **Avoid
  Backup Bison's cool-navy darks.**
- **Dual-mode**: must work in BOTH light and dark. **Dark-first is the primary/hero
  presentation;** light is fully supported (docs, decks).

**Typography.**
- Display / headlines / UI: **Space Grotesk** (the parent's own studio voice).
- Mono accent (eyebrows, labels, metadata, deploy/technical cues): **JetBrains Mono** —
  deliberately shared with Backup Bison as a subtle family "technical signature."
- Body / longer copy: Space Grotesk regular; system-sans fallback for dense text.
- Scale (locked, adjustable only with founder sign-off): Display `clamp(40px,6vw,72px)`/700/lh1.02;
  H2 `clamp(24px,3vw,34px)`/700; H3 `20px`/600; body `16.5px`/400/lh1.6; eyebrow JetBrains Mono
  `11px`/500/uppercase/+1px tracking.

**Mark type — standalone symbol + wordmark.** A real, distinctive symbol (not a monogram-only mark).

**Hard differentiation.** Must NOT resemble Backup Bison's identity: cool-dark navy + violet
`#8b5cf6` + realistic bison mascot. Different hue, different feel.

## YOUR calls to make (open — diverge first)

1. **Symbol concept + logo execution.** Design the standalone symbol. Candidate concepts to
   react to (react AND propose your own — this is not a menu):
   - *Play/deploy triangle* — one geometric triangle reading as both a play button (video, the
     audience) and a deploy/forward caret (ship it). Double meaning, ownable, great favicon.
     Keep it sharp/geometric to dodge the media-player cliché.
   - *Deploy-to-node* — forward motion resolving into a precise point ("deploy → answer").
     Infrastructure/technical, low cliché.
   - *Forward chevron stack* — ship/progress; clean but more common.
   Requirements: works at 16px favicon; works as a 1-color stamp; reads coral-on-ink AND
   ink-on-white; pairs cleanly with the Space Grotesk wordmark.

2. **Exact coral hex + full neutral/tonal scale.** Tune the final signal-coral (around
   `#FF5436`; warmer or hotter is fine if it pops in both modes and passes contrast on ink
   and white). Build the complete tonal ramp: ink, off-white, 4–6 greys, accent + 1–2 accent
   tints for states. Deliver as design tokens (CSS custom properties + a hex table).

## First-pass requirement (IMPORTANT)
**Diverge before you converge.** On pass one, present:
- **3 distinct symbol/logo directions** (sketch-level lockups, shown light + dark), each with a
  one-line rationale.
- **2–3 coral-hex candidates**, swatched against ink and white.
Then stop and let the founder pick a direction before you refine to final.

## Deliverables (after the founder picks)
- Symbol + wordmark lockups: primary, stacked, mark-only, **endorsement stamp**, favicon/avatar
  — in light and dark.
- Color tokens (hex + CSS variables) and type tokens (families, weights, scale).
- A **one-page brand sheet** (the system at a glance).
- **One applied sample** to prove it lives — your choice of a landing-page hero OR a business card.

## Voice note (for any copy you set)
Justin's register: short sentences, plain language, confident, no em dashes. Working verbal
hook to test (not locked — beat it if you can): **"We deploy real answers."**

## Non-negotiables recap
Endorsed parent / own identity · standalone symbol + wordmark · monochrome + signal coral ·
Space Grotesk + JetBrains Mono · dual-mode, dark-first hero · must not look like Backup Bison.
