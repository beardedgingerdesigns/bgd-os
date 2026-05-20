# DESIGN.md

Snapshot of the current design system as it stands today. This file describes what's wired up. Edits to expand the system should land here.

## Brand

This design system is anchored to **Bearded Ginger Designs** — Justin's web studio brand at `beardedgingerdesigns.com`. The aios-ui adopts BGD's palette and typography so the operator tool feels like it belongs to him, not a generic dev dashboard.

**Primary brand color**: gold `#fdb414` → `oklch(0.818 0.167 79)`
**Secondary accent**: orange `#f18821` → `oklch(0.727 0.164 58)`
**Page bg**: near-black `#0a0a0a` → `oklch(0.145 0 0)`
**Surface**: dark gray `#1a1a1a` → `oklch(0.218 0 0)`
**Lifted surface**: `#2d2d2d` → `oklch(0.297 0 0)`

## Theme

**Dark forced.** `<html className="dark">` in `app/layout.tsx`. No light mode wired up. Rationale: operator works in dim rooms next to dark-mode editors, and BGD's site reads as dark-and-warm.

**Color strategy**: Restrained with one strong accent — the BGD gold. Reserved for: hover/active state in nav, focus rings, primary CTAs (sparingly). Orange `--brand-secondary` is available for state differentiation but used cautiously to avoid color noise.

## Tokens

OKLCH everywhere. Defined in `app/globals.css`:

| Token | Dark value | Use |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Page surface (BGD `#0a0a0a`) |
| `--foreground` | `oklch(0.985 0 0)` | Body text |
| `--card` | `oklch(0.218 0 0)` | Card surface (BGD `#1a1a1a`) |
| `--card-foreground` | `oklch(0.985 0 0)` | Card text |
| `--muted` | `oklch(0.297 0 0)` | Lifted surface (BGD `#2d2d2d`) |
| `--muted-foreground` | `oklch(0.71 0 0)` | Secondary text |
| `--accent` | `oklch(0.297 0 0)` | Hover background |
| `--border` | `oklch(1 0 0 / 10%)` | Hairlines |
| `--input` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `oklch(0.818 0.167 79)` | Focus ring (BGD gold) |
| `--brand` | `oklch(0.818 0.167 79)` | BGD gold `#fdb414` — active state, focus, primary actions |
| `--brand-foreground` | `oklch(0.145 0 0)` | Text on solid brand fills |
| `--brand-muted` | `oklch(0.818 0.167 79 / 16%)` | Tinted brand background for active states |
| `--brand-secondary` | `oklch(0.727 0.164 58)` | BGD orange `#f18821` — secondary accent, reserved |
| `--brand-secondary-muted` | `oklch(0.727 0.164 58 / 16%)` | Tinted secondary background |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Errors |

Chart ramp (`--chart-1` → `--chart-5`) is a gold → orange → deep amber gradient, mapped to the BGD palette. Charts no longer require token extension to work.

## Typography

**Font family**: `Roboto Slab` (a slab serif) loaded via `next/font/google` in `app/layout.tsx`. Weights: 300 / 400 / 500 / 600 / 700. The font variable is `--font-roboto-slab` and is wired into `--font-sans` so all `font-sans` utilities pick it up. Fallback stack: `Georgia, "Times New Roman", serif`.

This is intentional and on-brand: Roboto Slab is what beardedgingerdesigns.com uses. The slab serif gives the operator tool personality without resorting to display fonts or marketing flourish — it reads as confident and lived-in. Single family carries headings, body, labels, data.

- Scale (Tailwind defaults): `text-xs` (12), `text-sm` (14), `text-base` (16), `text-lg` (18), `text-xl` (20), `text-2xl` (24).
- H1 pattern: `text-2xl font-semibold tracking-tight`.
- Section labels: `text-xs uppercase tracking-wider font-medium text-muted-foreground`. Micro-labels can drop to `text-[10px]` — check legibility, slab serifs read smaller than sans at those sizes.
- Body data: `text-sm`. Metadata: `text-xs text-muted-foreground`.
- All numbers use `tabular-nums` so MRR figures, dates, and counts line up.
- Mono is reserved for path strings (`docs_paths`) — Geist Mono fallback.

## Layout

- Page container: `max-w-7xl` (home) or `max-w-6xl` (client/project) with `px-6 py-8`.
- Page grid: `grid-cols-1 lg:grid-cols-3 gap-6` for top widget row.
- Card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` for clients/projects.
- Sidebar: fixed `w-64`, only on client and project routes (NOT on home — known inconsistency).
- No top global navigation, no breadcrumbs on home.

## Components (shadcn primitives)

Wired up: `Card` (Header/Content/Description/Title), `Button` (default + ghost + icon-size variants), `Badge` (default, outline, secondary), `Dialog`, `Separator`. Lucide for icons (`BookOpen`, `FileText`, `Lightbulb`, `Send`, `Loader2`, `ChevronDown/Up`).

Half-built or missing:
- No `Input` primitive used yet (textarea in ChatDrawer is raw).
- No `Tabs`, no `Tooltip`, no `Skeleton`, no `Toast`.
- No data viz library.

## Component States

State coverage is **incomplete**:

- **Hover**: `Card` inside `Link` gets `hover:bg-accent/40`. Sidebar items get `hover:bg-accent/40`. Buttons inherit shadcn defaults.
- **Active / selected**: Sidebar marks active with `bg-accent` (same as hover; weak differentiation).
- **Focus**: `focus:ring-2 focus:ring-ring` on textarea. Buttons inherit. Visible but not strong.
- **Disabled**: Buttons handle it. Text inputs do not visually differentiate.
- **Loading**: Lone `Loader2` spinner in the send button. No skeletons anywhere.
- **Empty**: Static text strings — `"No contacts on file."`, `"Nothing in the last 30 days."` — small, easy to miss.
- **Error**: ChatDrawer surfaces error text in messages. No global toast.

## Motion

`tw-animate-css` is imported but currently unused in any custom component. Default Tailwind transitions on hover only. No purposeful motion strategy.

## Known Gaps

1. **Cards-vs-rows preference.** The first layout pass replaced cards with sectioned rows. Justin's stated preference is cards. Revisit by mixing card tiles back in — possibly an asymmetric / bento-style arrangement so cards aren't an identical grid (the anti-pattern was uniformity, not cards themselves). Applies to home (clients) and client page (projects).
2. **No global app shell.** Sidebar still only appears on client/project routes. Home has no left nav. P0 deferred from the Path B scope of the first impeccable pass.
3. **Chat is still inline below project content.** Collapsible card, not a docked rail. P0 deferred.
4. **Status differentiation is uppercase text only.** Could earn one more pass to use `--brand-secondary` for "paused" or "at risk" projects, if visual triage becomes a need.
5. **Roboto Slab at very small sizes** (`text-[10px]` micro-labels). Slab serifs lose legibility under ~11px. Revisit if any label reads as mush.
