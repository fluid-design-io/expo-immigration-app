# Immigration App

All-in-one US/USCIS immigration app (Expo SDK 56 + HeroUI Native Pro + Uniwind, iOS + Android). v1 = guided **I-765/EAD renewal** spine (auth → reusable profile → document vault → filing wizard → case tracker → calendar/reminders). Forum + news are v1.1.

## Design System
Always read `DESIGN.md` before making any visual or UI decision. All fonts, colors, spacing, radius, and aesthetic direction are defined there: **Fraunces** serif display + **DM Sans** body (via `@expo-google-fonts`), warm paper `#F1EFE8` base, white cards, near-black `#1F1E1C` primary, blue `#185FA5` accent, green/amber/red status. Component patterns and the per-surface reference board live in `docs/design/`. Do not deviate without explicit user approval. In QA, flag any UI that doesn't match `DESIGN.md`.

## Project docs (read before working)
- `docs/PROGRESS.md` — strict phase tracker. **Follow phases in order.**
- `docs/DECISIONS.md` — decision log.
- `docs/PRD.md` · `docs/DATA-MODEL.md` · `docs/ARCHITECTURE.md` · `docs/IMPLEMENTATION-PLAN.md` · `docs/spikes/`

## Stack notes
- Bun monorepo: `apps/mobile` (Expo app), `apps/server` (Hono backend — built at Phase 5), `packages/shared` (Zod types shared client+server, `@immigration/shared`).
- Gotchas: heroui-native `Typography` exposes `Heading`/`Paragraph`/`Code` (no `Title`). TS 6 deprecates tsconfig `baseUrl`. Push notifications + secure store require an EAS **dev build** (not Expo Go).
