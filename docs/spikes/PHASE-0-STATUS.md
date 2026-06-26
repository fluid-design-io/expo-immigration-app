# Phase-0 Status — De-Risking Synthesis

> **Scope:** v1 = I-765 / EAD renewal only. **Date:** 2026-06-22. **Inputs:** four Phase-0 spikes (USCIS Case-Status API, dependency version matrix, I-765 form-logic / UPL boundary, PII threat-model). See `docs/spikes/` source memos. This memo is the go/no-go roll-up that feeds `docs/IMPLEMENTATION-PLAN.md` and resolves open items in `docs/DECISIONS.md`.

## TL;DR

Phase 0 clears the path to **build the I-765 wizard, the metadata-only PII vault, and a manual-first case tracker** — the entire core retention loop ships without any external dependency. Two of four gates are clean. The other two are **CONDITIONAL, not blocking**: the USCIS live-sync API is a deliberate NO-GO for v1 (designed around with a manual fallback behind an API-ready seam), and the dependency matrix is YELLOW pending a single physical-device EAS build. **Nothing here blocks engineering from starting.** What it blocks is *shipping to real DACA/asylum/TPS users*, which is gated on human/legal/government actions (attorney engagement + E&O + legal entity, en/es legal-copy review) that must start **now** because of their multi-week lead times.

## Gate scorecard

| Gate | Verdict | One-line reason |
|---|---|---|
| **USCIS Case-Status API** | **NO-GO (for v1 live sync)** | Per-org OAuth gated to vetted US-incorporated "representatives," weeks-to-months onboarding, no consumer-redistribution clause — ship manual-entry fallback behind an API-ready `CaseStatusProvider` seam. |
| **Dependency version matrix** | **CONDITIONAL (YELLOW)** | SDK 56 core is internally consistent and `tsc` passes clean; YELLOW is three native/pre-release risks (heroui-native-pro beta.5, transitive-only Skia, missing Better Auth Expo peers) clearable only by one physical-device EAS build. |
| **Form / UPL readiness** | **CONDITIONAL** | Form logic, field classification, and disclaimer copy are drafted and structurally valid on edition 03/13/26, but the schema + disclaimers + attorney checklist are explicitly attorney-review-pending and cannot ship without counsel sign-off. |
| **PII / threat-model** | **GO (CONDITIONAL on KMS infra)** | Design is decided and the erasure ↔ RESTRICT ship-blocker is resolved via crypto-shredding; GO to build on app-layer AES-256-GCM with an external KMS (not pgcrypto-in-DATABASE_URL), conditional on standing up KMS + per-user keys before any real PII is stored. |

## What is now SAFE to build

These have no unresolved external dependency and can start immediately:

1. **The I-765 renewal wizard** on the draft step-schema (10 steps, edition `03/13/26` printed on every exported page; edition is config, re-verified per release — never hardcoded in UI copy).
2. **The mechanical/legal-judgment field split** as the core architecture: mechanical fields are vault-backed, auto-fill + copy-forward (the retention engine — 2nd filing near one-tap); legal-judgment fields (Item 27 eligibility category, reason-for-applying, status characterization, fee/exemption, criminal history) are per-filing, disclaimer-gated, suggest-not-decide, **never auto-decided**.
3. **The two hard category branches:** c(9) suppresses the I-94 document requirement; c(33) adds the mandatory I-765WS worksheet.
4. **Manual-first case tracker:** receipt-number entry with deterministic prefix validation (3 letters + 10 digits; IOE/EAC/WAC/LIN/SRC/MSC/NBC/YSC), `source = "manual"`, user-logged status writing `case_status_events`. Architect sync behind a `CaseStatusProvider` interface so a future approved USCIS API is a drop-in with **zero schema migration**.
5. **The PII vault:** app-layer AES-256-GCM over the §2 field set, **external KMS + per-user keys** (enables crypto-shredding), blind-index (HMAC) columns for equality lookup on encrypted `receipt_number` (and A-number if dedupe needed), `documents.file_key` NULL (metadata-only), `audit_log.ip` not stored long-term (no-IP preferred; else salted/truncated with 7–30 day TTL).
6. **Data-minimization posture:** collect only fields the I-765 PDF renders; lazy PII collection (no DOB/country/nationality at signup); never collect SSN; pseudonymous forum (display_name only).
7. **"Submit" = export only** semantics across all UI — no field, label, or button may imply the app files with USCIS; the app must never silently list itself as preparer.
8. **The SDK 56 core stack** (Expo 56.0.12 / RN 0.85.3 / React 19.2.3 / TS 6.0.3 / Reanimated 4.3.1 + Worklets 0.8.3 / Uniwind 1.9.0 / HeroUI Native 1.0.4) and **backend libs** (Hono 4.12, drizzle-orm 0.45.2 pinned exact, drizzle-kit 0.31.10, pg 8.22, better-auth 1.6.20) — all GREEN-grade, server libs have no RN coupling.

## What is BLOCKED-until

| Item | Blocked until |
|---|---|
| **Shipping I-765 wizard / disclaimers to real users** | Immigration counsel signs off on the form schema, the 5 disclaimer surfaces, and the 12-item attorney-review checklist (form-readiness gate is attorney-review-pending). |
| **Any code that stores real user PII** | External KMS + per-user data keys are provisioned and the encrypt/decrypt + crypto-shred path is verified (PII gate is GO *conditional* on this infra). |
| **Committing the dependency/build timeline as GREEN** | One physical-device EAS dev build boots, renders a Pro chart (exercises Skia + victory-native + beta together), runs a Reanimated animation, and completes a Better Auth login with SecureStore persistence. |
| **Relying on `heroui-native-pro` charts** | `@shopify/react-native-skia` promoted from transitive-only to a direct pinned dep and rebuilt; Pro auth/CDN gating confirmed to resolve in CI/EAS, not just locally. Have a fallback (HeroUI Native stable + hand-rolled charts) if the beta blocks ship. |
| **Committing the backend/auth timeline** | Missing `@better-auth/expo` peers added (`expo-secure-store`, `expo-web-browser`, `expo-network`) and secure session storage verified on-device against Hono + Better Auth under SDK 56 (docs target SDK 55). |
| **Live USCIS case-status sync** | A production USCIS agreement with explicit consumer-display terms — pursued in parallel as a v1.x/v2 enhancement, **never a v1 dependency**. Until then do not architect around redistributing API status to end users. |
| **Any "cases like yours" / PII cohort feature** | Indefinitely deferred — conflicts directly with field-level encryption; if ever wanted, index derived non-PII buckets (age_band, form_code) at write time, never decrypt. |

## External actions (human / counsel / government)

These have real lead times and are the true critical path to a user-facing launch. **Start the long-pole items immediately.**

| Action | Owner | Lead time |
|---|---|---|
| Engage immigration counsel to review form schema, disclaimer copy, and the 12-item attorney checklist; stand up E&O (professional-liability) insurance; form the legal entity. | Founder / counsel | 4–8+ weeks; start now — gates all wizard shipping |
| Adopt the government-data-request / threat-model policy (lawful-process posture, no voluntary ICE cooperation, user notification, transparency report, legal-hold runbook) and confirm the metadata-only + encrypted-PII custody decision (D7) with counsel. | Founder / counsel | 2–4 weeks; runbook must exist *before* the first request arrives |
| en + es legal-copy translation review — disclaimers and legal-bearing strings reviewed as an accuracy (attorney) task, not a localization checkbox, for a non-native-English audience. | Counsel + bilingual legal reviewer | 2–3 weeks; depends on counsel-approved English copy first |
| Begin USCIS Developer Portal org onboarding **in parallel** (register org + Developer Team App, sandbox build, sandbox traffic, attestation, signed affidavit, live App Demo on Wed/Thu afternoons, 508 + privacy policy + public site due diligence). Pursue as v1.x/v2, not a v1 blocker. | Founder / eng | Weeks-to-months, not guaranteed for a consumer app |
| Run the physical-device EAS dev build (New Arch, Hermes v1, Xcode 26.4+/iOS 16.4 min): boot + Pro chart + Reanimated + Better Auth SecureStore login. Clears the YELLOW matrix to GREEN. | Eng (needs a real device) | Days; do early to surface native-module surprises |
| Provision external KMS (AWS KMS or Cloudflare) with envelope encryption + per-user data keys, separate from `DATABASE_URL`; verify crypto-shred erasure path (30-day SLA incl. backups). | Eng / infra | Days–1 week; gates storing real PII |

## Schema / decision deltas this memo confirms

- **Resolves `docs/DATA-MODEL.md` open question (L415/L416):** case tracker is manual-first with an API-ready seam; documents vault is metadata-only (`documents.file_key` NULL) for v1.
- **Resolves the erasure ↔ RESTRICT ship-blocker:** change `applicationDocuments.documentId` from `RESTRICT` to support crypto-shred/tombstone; "immutable application" = audit/structure preserved, PII always erasable; v1 default hard-deletes applications on account deletion (user keeps their exported PDF; we keep nothing).
- **Confirms `docs/DECISIONS.md` D9** (manual-first; live sync only on a GO — which this memo records as NO-GO for v1) and **D7** (encrypt structured PII), and discharges the two PII/threat-model open decisions pending counsel adoption.
- **Encryption deltas:** encrypt the §2 field set (currently only `a_number_enc`); add HMAC blind-index columns; make `audit_log.ip` optional + add purge job; per-user key derivation for crypto-shred.
