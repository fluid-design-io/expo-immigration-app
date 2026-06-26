# Design workspace

> Persistent home for everything visual, so design context **survives across chat sessions**. These are committed repo files — they don't disappear when a conversation ends. My long-term memory points here, so future sessions read this before building any UI.

## What's here

| File / folder | What it holds |
|---|---|
| `references.md` | The **collected Mobbin patterns** — per screen: which app, what we liked, the pattern to adopt. This is where pasted screenshots get turned into durable notes. |
| `design-system.md` | The **design system** — color, typography, spacing, radius, motion tokens (HeroUI Native–compatible). The single source of truth for how the app looks. |
| `references/` | **Drop screenshot image files here** (e.g. `wizard-01.png`, `home-02.png`) so they live in the repo, not just in chat. |

## The Phase-2 workflow (where we are)

1. You collect Mobbin references per screen (see `docs/SCREENS.md` checklist).
2. You paste them in chat **or** drop the image files into `references/` (name them `screen-NN.png`).
3. I record the analysis in `references.md` (app + pattern + what we adopt) — this is the part that persists.
4. We lock tokens in `design-system.md` via `/design-consultation` + the `heroui-pro-design-taste` skill.
5. Those tokens drive every screen we build in Phase 6.

**Design direction (the brief):** trustworthy, calm, government-adjacent but human. Reduce anxiety; plain language; lots of breathing room.

*Created 2026-06-22 (Phase 2).*
