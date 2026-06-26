## Dependency Version-Matrix Spike — I-765/EAD v1

**Overall: YELLOW.** The Expo SDK 56 core (Expo 56.0.12 / RN 0.85.3 / React 19.2.3 / TS 6.0.3 / Reanimated 4.3.1 + Worklets 0.8.3 / Uniwind 1.9.0 / HeroUI Native 1.0.4) is internally consistent and version-aligned — SDK 56 is the anchor that pins exactly these versions. **`tsc --noEmit` passes clean (exit 0)** against the installed tree, so the type surface compiles under TS 6. Nothing here is a blocker. The YELLOW comes from three pre-release / dependency-hygiene risks, none individually fatal but all requiring a real EAS build to clear.

### What's solid (GREEN-grade)
- **Core Expo/RN/React/TS quad** — released, mutually pinned by SDK 56. New-Arch + Hermes v1 only; needs Xcode 26.4+/iOS 16.4 min.
- **Reanimated 4.3.1 / Worklets 0.8.3** — correct lockstep pair for SDK 56. Keep pinned together.
- **HeroUI Native 1.0.4** — stable v1; every peer satisfied by the installed stack.
- **Backend libs (Hono 4.12, drizzle-orm 0.45.2, drizzle-kit 0.31.10, pg 8.22, better-auth 1.6.20)** — all server-side, no RN coupling, well-supported on Railway Postgres. Lowest risk in the matrix. (Drizzle is pre-1.0 — pin exact.)

### The three risks driving YELLOW

1. **`heroui-native-pro@1.0.0-beta.5` is a pre-release (flagged).** The installed beta IS the real runtime component library (charts, calendar, badge…), not a CLI. It works against the current stack and its declared peers resolve, but a beta carries no semver stability guarantee — APIs can shift between betas. It is also gated behind HeroUI Pro auth (`heroui-pro`/`@heroui-pro/react` in `trustedDependencies`), which must resolve in CI/EAS, not just locally. **Pin the exact beta; do not float; budget for churn.**

2. **`@shopify/react-native-skia` is transitive-only.** It resolves to 2.6.6 (works with SDK 56/RN 0.85) but is **NOT in `package.json` dependencies** — it arrives only via `victory-native`, and is a required peer of the Pro charts. A native module sitting as a transitive dep is fragile: a `victory-native` bump could move or drop it and silently break the native build. **Promote to a direct, pinned dependency and rebuild.**

3. **Better Auth Expo client has missing peers.** `@better-auth/expo@1.6.20` requires `expo-web-browser`, `expo-network`, and (per the integration guide) **`expo-secure-store`** for session storage — none are in `package.json` yet. For a DACA/asylum/TPS audience with a metadata-only-vault + encrypted-PII posture, secure on-device session storage is load-bearing. Official docs target SDK 55/RN 0.83, so the SDK 56 path needs an explicit smoke test. **Add the peers and verify on-device before committing the backend timeline.**

### Bottom line for the timeline
Do not commit the schedule on a green-bundling assumption. JS bundling and `tsc` passing prove nothing about the three native/pre-release surfaces (Skia, the Pro beta, secure storage). The gating proof is a **single EAS dev build on a physical device** that boots, renders a Pro chart (exercises Skia + victory-native + the beta together), runs a Reanimated animation, and completes a Better Auth login with SecureStore persistence. If that build is green, this matrix moves to GREEN. The most likely schedule-slip source is `heroui-native-pro` remaining in beta through v1 ship — have a fallback plan (HeroUI Native stable + hand-rolled charts) if the Pro beta blocks.
