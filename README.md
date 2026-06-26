# Immigration App (monorepo)

All-in-one US/USCIS immigration app — guided **I-765/EAD renewal** filing, case tracker, deadline calendar with reminders, discussion forum (v1.1), and news (v1.1). Built around a retention-focused data model so renewals are near one-tap.

## Workspace layout

```
apps/
  mobile/      Expo SDK 56 app (React Native, Expo Router, HeroUI Native Pro, Uniwind)
  server/      Backend — Hono + Drizzle + Better Auth on Railway (scaffolded in Phase 2)
packages/
  shared/      Types (and, later, Zod schemas) shared between mobile + server
docs/          PRD, architecture, data model, decisions, and Phase-0 spike memos
```

## Getting started

```bash
bun install                 # install workspace deps + link packages
bun run mobile              # start the Expo app (apps/mobile)
# or:
cd apps/mobile && bunx expo start
```

> **Dev build required.** This app uses push notifications + secure storage, so it needs an
> [EAS development build](https://docs.expo.dev/develop/development-builds/introduction/) — Expo Go won't work.

## Docs

- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log (start here)
- [`docs/PRD.md`](docs/PRD.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md)
- [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md) · [`docs/PHASE-1-REVIEW.md`](docs/PHASE-1-REVIEW.md) · [`docs/spikes/`](docs/spikes/)
