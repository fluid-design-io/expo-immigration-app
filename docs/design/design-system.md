# Design system

> The single source of truth for how the app looks. HeroUI Native + Uniwind (Tailwind) tokens.
> Status: **FINALIZED 2026-06-22 via `/design-consultation`. Canonical token source: [`/DESIGN.md`](../../DESIGN.md).** This file holds the component-level patterns + working notes that feed it. Direction: *trustworthy, calm, government-adjacent but human.*

## Direction
- **Adjectives:** trustworthy, calm, clear, human (not cold/bureaucratic).
- **Anti-template:** generous spacing, strong hierarchy (one focal point per screen), one primary action per screen, plain language.
- **Feel references:** Liven (calm, gentle motion) · Vocabulary (warm paper, friendly) · NordVPN (clean status hero) · Granola (warm, sectioned, rounded). Superpower's comparison-card noted for later.
- **Buttons:** large, full-width; **near-black primary** (modern, ChatGPT-style) + secondary outlined; accent reserved for links/highlights; primary **disabled until valid**. Rounded-rect (pills reserved for chips/FABs).
- **Screen tiers:** branded welcome (warm/colorful) → **clean functional screens** (auth, forms, home) on a warm-neutral base with white cards.

## Color — proposed starter (confirm)
Warm-neutral base · white rounded cards · near-black primary · blue brand accent · semantic status colors.

| Role | Use | Light (proposed) |
|---|---|---|
| `background` | app background | warm off-white `#F1EFE8` |
| `surface` | cards / sheets | white `#FFFFFF` |
| `foreground` | primary text | near-black `#1F1E1C` |
| `muted` | secondary text | `#5F5E5A` |
| `primary` | main buttons | near-black `#1F1E1C` (white text) |
| `accent` | brand, links, focus | blue `#185FA5` |
| `success` | approved / on-track | green `#3B6D11` · dot `#639922` |
| `warning` | due soon | amber `#854F0B` · dot `#EF9F27` |
| `danger` | overdue / errors | red `#A32D2D` |
| `border` | dividers / outlines | `#E6E3DA` |

> Dark mode: warm near-black base, elevated dark cards, same accent/status hues. Must pass WCAG AA. Map to HeroUI Native theme + Uniwind/Tailwind `@theme`.

## Typography (finalized)
- **Display / headings: Fraunces** (warm serif) · **Body / UI: DM Sans** · **numbers: DM Sans `tabular-nums`**. Load via `@expo-google-fonts/fraunces` + `@expo-google-fonts/dm-sans`. See [`/DESIGN.md`](../../DESIGN.md) for the full rationale + loading.
- **Scale:** display 28/600 + h1 24/600 (Fraunces) · section 20/600 · card title 17/600 · body 15/400 · caption 13/400 (DM Sans). Line-height ~1.4–1.6.

## Spacing & layout
- **Scale:** 4 / 8 / 12 / 16 / 24 / 32. Prefer flex `gap` over margins.
- Screen padding: 20px horizontal. Gap between sections: 24px.

## Radius & elevation
- **Radius:** cards 16–20 · buttons 14 (rounded-rect) · inputs 12. Use `borderCurve: "continuous"`. Full pills reserved for chips/FABs.
- **Shadow:** none, or one very subtle `boxShadow`. Depth comes from warm bg vs white cards.

## Motion
- **Durations:** fast 150ms · normal 250ms. **Easing:** ease-out `cubic-bezier(0.16, 1, 0.3, 1)`.
- Animate transform / opacity only; gentle entrances. Respect reduced-motion.

## Iconography
- SF Symbols on iOS (native tabs / `expo-image` `sf:`); Material fallback on Android.

## Forms (emerging)
- Labeled inputs; clean white fields (filled or outlined).
- **Inline validation with checkmarks** (password rules tick as satisfied).
- Password show/hide eye toggle.
- Primary action **disabled until valid**.
- Marketing opt-in is a **separate** checkbox from the Terms/Privacy agreement.
- Social auth (Apple/Google) buttons: layout-ready now, wired post-v1.
- **Wizard:** **divide wisely — one topic per screen; group only tightly-related fields (e.g. a whole address); never overwhelm** · top progress bar + back · bottom Continue (disabled until answered) · autosave drafts · intro screen with a step roadmap + reassurance (time · what you'll need · save-progress · not-legal-advice).
- **Selection controls:** single-select cards (filled dark + ✓) · single-select list for longer sets · multi-select checkboxes (always with an "Other / none" escape) · 2×2 choice grid (icon + label) · radio list with descriptions + optional "Recommended" badge · typed fields + native pickers (date, state).
- **Destructive actions:** a confirm screen/sheet — "Are you sure?" + permanent-consequence text + **red primary** ("Yes, delete") + outlined Cancel. For account/data deletion.
- **Calendar:** month grid with colored deadline markers (per kind) + today highlighted; an agenda grouped by date below.

## Empty states
- Centered illustration + short heading + one helpful line + generous whitespace. One clear way to add (button/FAB). No clutter.

## Content density & data viz
- **Curate ruthlessly** — only what helps the user act earns a spot; push the rest behind "view all". Never cramped.
- Focal numbers for at-a-glance; **one purposeful chart max** per screen (insight, not decoration).
- Best-fit viz for us: a status ring (on-track %) and a processing-time context bar ("typical X; you're at Y").

## Accessibility
- AA contrast, large legible type, screen-reader labels on every form field, 44pt touch targets.
