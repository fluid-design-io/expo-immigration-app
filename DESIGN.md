# Design System — Immigration App

> Canonical design source of truth. Read this before any visual or UI decision.
> Created 2026-06-22 via `/design-consultation`, grounded in the user's curated reference board (`docs/design/references.md`). Component-level patterns live in `docs/design/design-system.md`.

## Product Context
- **What this is:** all-in-one US/USCIS immigration app. v1 = guided **I-765/EAD renewal** spine (auth → reusable profile → document vault → filing wizard → case tracker → calendar/reminders). Forum + news are v1.1.
- **Who it's for:** immigrants renewing work authorization/status. Often non-native English, anxious, infrequent use.
- **Space/industry:** immigration / civic tech, high-stakes personal data. Peers: Lawfully, CitizenPath, Boundless, SimpleCitizen.
- **Project type:** native mobile app (Expo SDK 56 + HeroUI Native Pro + Uniwind), iOS + Android.

## Memorable thing
An immigration app that feels **calm and human, not like a government form.** Every choice serves that.

## Aesthetic Direction
- **Direction:** calm-civic / warm-minimal.
- **Decoration level:** minimal. The warm "paper" background is the one atmospheric move; typography and cards do the rest.
- **Mood:** calm, trustworthy, human. Competent without feeling clinical. Lower the user's blood pressure while they handle stressful paperwork.
- **Feel references:** Granola (warm, serif, sectioned), Liven (calm), Monzo (friendly reassurance), NordVPN (clean status hero). Full board: `docs/design/references.md`.

## Typography
- **Display / headings: Fraunces** (warm humanist serif). The strongest "human, not a gov form" signal; matches the Granola reference.
- **Body / UI: DM Sans** (clean humanist sans, highly legible at small sizes for anxious / non-native-English readers).
- **Labels:** DM Sans (same as body).
- **Data / numbers:** DM Sans with `tabular-nums` (deadlines, days-left, receipt numbers). DM Mono optional for receipt numbers.
- **Loading (Expo):** `@expo-google-fonts/fraunces` + `@expo-google-fonts/dm-sans` via `expo-font` `useFonts`; register the family names in the HeroUI Native theme + Uniwind `@theme`. Keep weights lean: Fraunces 500/600 (display only), DM Sans 400/500/600.
- **Scale (px / weight):** display 28/600 (Fraunces) · h1 24/600 (Fraunces) · h2 20/600 · card title 17/600 · body 15/400 · caption 13/400 · micro 11. Line-height 1.4–1.6. Everything below h1 is DM Sans.

## Color
- **Approach:** restrained-balanced. Color is mostly neutral; the accent and status colors are meaningful, never decorative.
- **Primary:** near-black `#1F1E1C` — primary buttons + primary text.
- **Accent:** blue `#185FA5` — links, focus rings, selected states, brand highlights.
- **Neutrals (warm):** background `#F1EFE8` (paper) · surface `#FFFFFF` (cards) · border `#E6E3DA` · muted text `#5F5E5A` · hint `#9A968C`.
- **Semantic:** success `#3B6D11` (on-track / approved; dot `#639922`) · warning `#854F0B` (due soon; dot `#EF9F27`) · error `#A32D2D` (overdue) · info = accent blue.
- **Dark mode:** warm near-black base (~`#1A1916`), elevated dark surfaces (~`#242220`), reduce status saturation ~10–15%, keep the accent. WCAG AA in both modes.

## Spacing
- **Base unit:** 8px (with 4px half-steps).
- **Density:** comfortable-to-spacious. **Never cramped** (explicit user rule).
- **Scale:** 2xs(2) xs(4) sm(8) md(12) lg(16) xl(24) 2xl(32) 3xl(48). Screen padding 20. Section gap 24. Prefer flex `gap` over margins.

## Layout
- **Approach:** grid-disciplined, single-column mobile, card-based.
- **Grid:** single column; full-width cards within 20px gutters. Cap forms ~600px on tablets/large screens.
- **Border radius:** inputs 12 · buttons 14 · cards 16–20 · pills/chips/FAB full. Use `borderCurve: "continuous"`.
- **Navigation:** bottom native tabs (Home · Filings · Tracker · Calendar · Profile). One focal point per screen.

## Motion
- **Approach:** intentional, gentle.
- **Easing:** enter ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, exit ease-in, move ease-in-out.
- **Duration:** micro 100ms · short 150ms · medium 250ms · long 400ms. Animate transform/opacity only. Respect reduced-motion.

## Components & patterns
Token source-of-truth is this file. Component-level patterns (buttons, the selection toolkit — single-select cards/list, multi-select checkboxes, choice grid, radio+descriptions, typed forms + native pickers; the **wizard "divide wisely" chunking**; empty states; the destructive-confirm pattern; dashboard/data-viz restraint; the calendar) are documented in `docs/design/design-system.md`. The per-surface reference board is `docs/design/references.md`.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-22 | Initial design system | Created by `/design-consultation` from the user's curated Mobbin reference board |
| 2026-06-22 | Warm paper base + Fraunces serif display + DM Sans body | "Calm, human, not a government form"; upgrades from the system font; matches the Granola reference |
| 2026-06-22 | Near-black primary, color reserved for status | Modern; lets green/amber/red carry real meaning |
