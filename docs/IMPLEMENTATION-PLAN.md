# Implementation Plan — Immigration App (US/USCIS Renewals)

> Consolidated, dependency-ordered build plan synthesizing the planner, CEO/office-hours, engineering, and design reviews. Supersedes the loose phase table in `docs/PRD.md`.
> Status: **GATED** — Phase 0 de-risking spikes + a 2-week user-validation sprint must complete before the full feature timeline is committed. See `docs/PHASE-1-REVIEW.md`.

## TL;DR — what changed from the PRD

- **v1 wedge narrows to I-765 / EAD renewals only.** I-90 is dropped from the validation build (10-year cadence can't prove a 12-month retention thesis). Schema unchanged — I-90 returns post-validation.
- **Document vault ships metadata-only** (no file storage in v1) to cut PII/breach liability and ship faster.
- **USCIS case-status API is a GO/NO-GO gate run first**, not a post-MVP "Could". Plan as **manual-first**.
- **"Submit" = export a user-verified PDF the user files themselves** (no third-party USCIS submission API exists).
- **Email is the durable re-engagement channel**; a dormant-user re-onboarding flow is an explicit v1 item.
- **i18n infra + string externalization from day one** (ship en + es); full multi-language is a fast-follow.
- **Two new workstreams**: a legal/UPL+accuracy workstream (attorney-owned) and a GTM/monetization-hypothesis workstream.
- **Monorepo + key-management decisions move to Phase 0** (they block parallel typed work and any PII storage).

---

## Phase 0 — De-risking spikes + validation (RUN FIRST, gates everything)

**Goal:** resolve the project-defining unknowns — USCIS data feasibility, the UPL/accuracy boundary, the submit semantics, the version matrix, key management, and (most important) whether the target cohort will trust and switch — before committing architecture or the timeline.

**Tasks**

- **User-validation sprint (highest priority, parallel to technical spikes).** Land 30–50 EAD/I-90 renewers (r/immigration, Facebook AOS/TPS groups, university international-student offices). Answer one question: will they trust a *free* app to file the form their work authorization depends on, and would they switch from Lawfully/CitizenPath? Output: a kill / pivot / proceed decision.
- **USCIS case-status GO/NO-GO (technical highest priority).** Register at developer.uscis.gov; test sandbox OAuth client-credentials, rate limits, returned fields, paper-vs-online coverage, redistribution ToS. Also probe the public Case Status Online endpoint's behavior/ToS/anti-bot. Output: a go/no-go memo + a field map to `cases`/`case_status_events`. **Expected outcome: NO — design manual-first.** Timebox 2 days.
- **UPL + form-accuracy workstream (attorney-owned, gates Phase 3).** Pull the official current-edition I-765 PDF + instructions; map every field to `applications.answers`; classify each field **mechanical-transcription (safe)** vs **legal-judgment (gate/disclaim/link-out)**. Build **one I-765 end-to-end with a golden-fixture test** that diffs generated output against a hand-verified correct filing. Get a **written attorney scope review (UPL sign-off)** + disclaimer/positioning copy. Define a process to detect/ingest new USCIS form editions. Output: the v1 `form_schema` JSON for I-765. Timebox 3 days + attorney lead time (start day 1).
- **Define "submit".** Confirm with counsel that the app generates a user-filed PDF (not submission/preparation). Adjust the wizard end-state, tracker linkage (no auto receipt-back), and the activation metric. Timebox 0.5 day.
- **Encryption / key-management decision (gates any PII storage).** External KMS or app-held key **separate from `DATABASE_URL`** (pgcrypto-with-key-in-DB is theater). Define rotation; accept that field-encrypted A-number can't be queried. Timebox 0.5 day.
- **Document-storage decision.** Confirm **metadata-only for v1** (`file_key` null); record the PII/compliance tradeoff and the future SSE-KMS + signed-URL design for when storage returns. Timebox 0.5 day.
- **Monorepo type-flow spike.** Prove a pnpm/turbo workspace where one shared Zod schema in `packages/shared` is consumed by both the Expo client and a Hono handler. Note Expo+EAS sharp edges (Metro resolution, hoisting, EAS working-directory). Timebox 0.5 day.
- **Version-matrix verification.** Verify Expo SDK 56 / RN 0.85 / React 19 against HeroUI Native Pro, Reanimated, the Better Auth Expo plugin, and the Better Auth + Hono + Drizzle adapter. Timebox 0.5 day.
- **Expo dev-build + push spike on a physical device.** Build a minimal EAS dev client, register an Expo push token, POST one message to exp.host, confirm delivery + the receipt second-pass. Verify timezone handling (UTC cron vs local calendar day). Timebox 1 day.
- **Drizzle partial-index DDL check.** Generate the migration for `reminders_due_idx`/`deadlines_upcoming_idx`; confirm the `WHERE` clause is emitted; if not, prove a raw-SQL migration. Timebox 0.5 day.

**dependsOn:** none · **parallelWith:** Phase 1 setup may begin once the monorepo + storage decisions land

**Exit criteria:** validation sprint returns proceed/pivot; USCIS go/no-go memo written; attorney UPL sign-off + I-765 `form_schema` + golden-fixture test green; "submit" defined; key-management + storage decisions recorded; monorepo proven with one shared Zod type; version matrix confirmed; one real push delivered to a physical device with correct local-day timing; partial-index `WHERE` clause confirmed in generated DDL.

**Estimate:** 6–8 dev-days (technical) + ~2 weeks validation (overlapping)

---

## Phase 1 — Foundations (frontend skeleton + auth + first-value loop)

**Goal:** a returning user can sign in, the session persists, the spine navigation exists, and a new user reaches first value (a reassuring deadline countdown) before being asked for sensitive PII.

**Tasks**

- Restructure into the monorepo: move `src/app`, `src/global.css`, assets into `apps/mobile`; create `packages/shared` (Zod schemas/types) and `apps/server`. Fix metro/tsconfig paths. (Do this first while the app is 4 files.)
- Create `eas.json` (dev/preview/prod), `app.config.ts` with the expo-notifications + expo-secure-store plugins, three EAS environments (secret-type for build-time).
- Add core deps: expo-secure-store, expo-notifications, expo-document/image-picker, TanStack Query, a typed API client reading the base URL from expo-constants, **i18n (string externalization, en+es) with text-expansion-tolerant layouts**.
- Navigation skeleton: replace `index`/`explore` with the real spine — **Home (deadline status/countdown surface), Filings, Tracker, Calendar, Profile** — plus an `(auth)` stack. Gate tabs behind an auth provider.
- Auth screens (sign up / sign in / forgot password) wired to Better Auth; token in expo-secure-store, sent as Bearer. HeroUI Native Pro form components; a11y + plain-language as design inputs.
- **First-value onboarding:** ask only status + expiry date first → immediately show the deadline countdown → defer A-number/PII until inside the wizard.
- Reusable applicant-profile UI (personal/DOB/country/A-number/phone/preferred language); A-number flagged sensitive (encrypted server-side). Address/employment/family editors.
- **Document vault UI metadata-only:** list/add/edit docType + issued/expiry + notes (no file upload in v1).
- **Trust layer (designed, not a checkbox):** persistent "not affiliated with USCIS / not legal advice / your data is encrypted" cues at onboarding, profile, and wizard review.
- Account settings: data export + account-deletion entry points (wired to stubs initially).

**dependsOn:** Phase 0 (monorepo + storage + version-matrix decisions) · **parallelWith:** Phase 2

**Exit criteria:** account persists across restarts; a profile field survives re-login; first-value deadline appears after status+expiry only; all five spine tabs + auth stack navigate; A-number never logged; en+es strings externalized; dev build runs on iOS + Android.

**Estimate:** 8–10 dev-days

---

## Phase 2 — Backend core (Railway: DB, API, auth, KMS)

**Goal:** a secure Hono API on Railway backed by Postgres + Drizzle, Better Auth self-hosted, field-level A-number encryption via external key, every query scoped by `user_id`. **No file storage in v1.**

**Tasks**

- Stand up Railway: Postgres + Hono service. Wire `DATABASE_URL`, auth secrets, **KMS/encryption key (separate from DATABASE_URL)**, Expo access token.
- Implement the Drizzle schema from `docs/DATA-MODEL.md`, split into `schema/{auth,profile,documents,applications,cases,calendar,forum,news}.ts`. Generate + run migrations. **Verify `reminders_due_idx`/`deadlines_upcoming_idx` emit the partial `WHERE`; add a raw migration + a migration test asserting the predicate if not.** App-side UUIDv7 for high-insert tables.
- Better Auth (self-hosted) + Drizzle adapter; `/auth/*`; Hono auth middleware injecting `user_id`; no PII-access secret ever reaches the client.
- API layer with `{success,data,error,meta}` envelope + Zod validation at every boundary from `packages/shared`. Endpoints: profile, addresses/employment/family, documents (metadata) CRUD — all scoped by `user_id`.
- **Field-level A-number encryption via the external key**; `audit_log` write path on view/create/update/delete/export of sensitive entities.
- Account export + deletion endpoints (cascade user-owned rows; forum authorship → NULL tombstone).
- **Email re-engagement service:** transactional + scheduled reminder email (the durable channel); design the reminder email as a product surface.
- Seed `application_types` with the attorney-reviewed I-765 `form_schema` (immutable versioned row). (I-90 deferred.)

**dependsOn:** Phase 0 (data-model reviewed; key-management + storage + form-schema decisions) · **parallelWith:** Phase 1

**Exit criteria:** a protected endpoint rejects unauthenticated requests and returns only the caller's data; account deletion cascades correctly in a test; A-number round-trips encrypted (never plaintext, key not in DATABASE_URL); a reminder email sends; I-765 type row seeded; partial-index predicate asserted by a migration test.

**Estimate:** 9–11 dev-days (down from 10–12; file-storage signed-URL work removed)

---

## Phase 3 — Filing wizard (I-765 only)

**Goal:** a user completes an I-765 renewal end-to-end, most fields pre-filled from profile + prior application, ending in a user-verified PDF export. The 2nd filing must feel near one-tap.

**Tasks**

- JSONB-schema-driven multi-step renderer in `apps/mobile` reading `application_types.form_schema` → writing `applications.answers`. Field types: text, date, select, address-ref, document-ref, boolean, repeatable group. **Reframe each step as one plain-language decision at a time** (official USCIS label secondary; inline "why we ask"; translatable).
- Draft autosave (debounced PATCH of `answers` + `currentStep`) with **visible "saved" state**; survives app kill (`status='draft'`).
- Profile pre-fill: hydrate `answers` from `applicant_profile`, current address, employment per `doc_requirements`. **Pre-filled values shown as confirm-or-edit, never re-entry.**
- Renewal clone path ("Renew" clones prior `answers` + sets `renews_application_id`). **Surface the time saved as a designed moment** ("We pre-filled 38 of 42 fields from your last renewal"). Instrument time-in-wizard 1st vs 2nd.
- Review screen + UPL-safe "verify before submitting" step with attorney-approved copy → **export a user-verified PDF** (submit = export). Set status `ready`/`submitted`.
- Per-form validation: encode I-765 mechanical fields as Zod; legal-judgment fields surfaced with guidance/links, never auto-decided. Golden-fixture test diffs output vs hand-verified filing.
- Deadline creation on submit: a `file_by`/expiry-derived deadline flows into calendar + reminders.

**dependsOn:** Phase 0 (attorney sign-off, I-765 form_schema, submit definition), Phase 1, Phase 2 · **parallelWith:** none

**Exit criteria:** a fresh I-765 completes end-to-end pre-filled from profile and exports a verified PDF; a renewal clone reopens pre-filled and completes ≥50% faster (measured); draft survives restart; review step shows the designed disclaimer; golden-fixture test green.

**Estimate:** 10–12 dev-days (down from 12–14; single form)

---

## Phase 4 — Case tracker (manual-first)

**Goal:** see case status + history in one place. Manual receipt entry is the baseline; USCIS API sync only if Phase 0 returned GO. The manual/empty state must feel alive.

**Tasks**

- Case CRUD UI + API: add a case by receipt number (Zod-validated 3-letter prefix + 10 digits), optionally link to an `application`, show `currentStatus` + the `case_status_events` timeline.
- Manual status entry + history (`case_status_events`, `occurred_at NOT NULL`, UUIDv7).
- **Empty/manual state designed to feel alive** using PRD processing-time data ("cases like yours typically take X") so it retains value with zero API.
- **IF USCIS API = GO:** sync path writes events, sets `source='uscis_api'`, updates `last_synced_at`, degrades gracefully to manual on failure.
- Engagement instrumentation defined **against manual-entry data** (not assuming fresh API status).
- Auto-create tracker-driven deadlines (RFE, biometrics) flowing into calendar/reminders.

**dependsOn:** Phase 2 (cases schema). API sub-path also depends on Phase 0 GO · **parallelWith:** Phase 5

**Exit criteria:** a case shows status + multi-event history; receipt format validated; the manual/empty state still reads as useful; if API=GO, one case syncs and degrades to manual on simulated failure; engagement events log against manual data.

**Estimate:** 6–8 dev-days (8–10 if API sync in scope)

---

## Phase 5 — Deadline status surface + push reminders (calendar secondary)

**Goal:** never miss a renewal window. The **primary surface is a countdown/status "am I safe?" answer**; the calendar is secondary. A daily cron fires Expo push, email backs the durable long-horizon reminders.

**Tasks**

- **Deadline status/countdown surface (primary):** one glance → color + a single number + a single next action (icon + text + color, never color-only). Calendar/agenda demoted to secondary (reads `deadlines_upcoming_idx`).
- Auto-generate deadlines from `documents.expiry_date`, applications, cases; generate `reminders` at 180/90/30/7-day leads. **Compute per-user timezone** so a UTC cron doesn't fire on the wrong local day.
- Register/manage push tokens (`push_tokens`, unique on token); permission prompts + refresh. **In-app deadline surface is source of truth; push is best-effort.**
- Daily Railway cron: query `reminders WHERE status='scheduled' AND remind_at <= now()` (rides `reminders_due_idx`), chunk ≤100, throttle <600/sec, POST exp.host, persist `push_ticket_id`. Idempotent sends keyed on `reminders.status`. Alert on cron failure.
- Receipt second-pass ~15 min later: disable dead `push_tokens` (`disabledAt`); mark reminders sent/failed.
- **Email reminder path** for long-horizon/dead-push-token cases (the durable channel).
- Deep-link push/email taps to the right deadline/filing/case screen (expo-router).

**dependsOn:** Phase 2 (deadlines/reminders/push_tokens schema + email service) · **parallelWith:** Phase 4

**Exit criteria:** a physical device receives a scheduled reminder on the correct local day; tapping deep-links correctly; a dead token is disabled after the receipt pass; a long-horizon reminder also arrives by email; document expiry auto-creates a deadline with reminders.

**Estimate:** 8–10 dev-days

---

## Phase 5.5 — Dormant-user re-engagement (north-star mechanism)

**Goal:** bring a user back after a 1–10yr gap assuming a new device, dead push token, and total amnesia. This is the literal retention mechanism and is currently unbuilt.

**Tasks**

- Design + build the **re-onboarding flow**: a returning user is effectively a new user who happens to have data; re-auth that survives a new device/email.
- Make a **visible "we'll remember your dates" promise** at first filing.
- Treat the **reminder email as the single most important re-acquisition asset** — design the email itself.

**dependsOn:** Phase 1 (auth), Phase 5 (email + deadlines) · **parallelWith:** Phase 4

**Exit criteria:** a simulated dormant user (new device, dead token, returns from an email) re-authenticates and lands on their pre-filled renewal.

**Estimate:** 3–5 dev-days

---

## Phase 6 — Harden + ship v1

**Goal:** the spine is safe, accessible, performant, and approved on both stores with an OTA channel live, and the retention funnel is measurable from launch.

**Tasks**

- Coverage to 80%: unit (Zod validators, pre-fill logic, deadline/reminder math, cron batching, golden-fixture), integration (auth, account-deletion cascade, USCIS fallback, email send), E2E for the critical path (sign up → profile → I-765 → tracker → reminder).
- Security/PII review (security-reviewer / `/santa-loop`): field-level A-number encryption with external key, audit_log coverage, every query scoped by `user_id`, no secret in the client bundle, HTTPS/headers.
- Accessibility + plain-language pass (already a design input from Phase 0/3): large default fonts surviving OS scaling, AA+ contrast, generous touch targets, screen-reader labels, never color-only urgency, reduced-motion.
- App-store readiness: privacy policy, accurate data-safety/privacy-nutrition disclosures, verified in-app account deletion, copy reviewed for any USCIS/government-affiliation implication.
- Performance: cold-start, bundle budget, list virtualization on calendar/tracker.
- EAS submit to App Store + Play; configure the EAS Update (OTA) production channel.
- **Wire north-star + funnel analytics** (distinct users with ≥2 applications, activation = exported verified PDF, reminder efficacy, repeat-filing speed, **cohort form-type mix**) so the retention hypothesis is measurable.

**dependsOn:** Phases 3, 4, 5, 5.5 · **parallelWith:** none

**Exit criteria:** ≥80% coverage with the critical-path E2E green; security review clean; both stores approve; OTA live; analytics report activation + retention + cohort-mix events from real sessions.

**Estimate:** 10–12 dev-days

---

## Phase 7 / 8 — v1.1 Forum + News (deferred until the loop validates)

Schema already exists (no change needed). Build forum (categories/threads/posts, pseudonymous, moderation from day one, push/email reply notifications) and news (RSS ingestion with `(source_id, external_id)` dedup, tag filtering, editorial `isPublished` gate, safe external links) **only after v1 proves the filing+tracking+retention loop**. Estimates: forum 8–10 dev-days, news 5–7 dev-days. Parallel with each other.

---

## Merged risk register

| # | Risk | Sev | Likelihood × Impact | Mitigation | Owner phase |
|---|------|-----|---------------------|------------|-------------|
| 1 | UPL + form-logic accuracy (wrong field → rejected filing → lost work auth → brand death) | **CRITICAL** (panel upgraded from M) | M × H | Attorney-owned workstream is a Phase-0 GATE on Phase 3; mechanical-vs-legal classification; golden-fixture diff per form; immutable versioned `application_types`; designed "verify before submit" liability layer; form-edition ingestion process | 0 → 3 |
| 2 | Retention thesis structurally fragile (≥25% in 12mo near-impossible if cohort skews I-90) | **CRITICAL** | M × H | Drop I-90; focus I-765 (1–2yr cadence); instrument cohort mix + repeat-filing funnel; treat 25% as a hypothesis | 0, 6 |
| 3 | No usable real-time USCIS status API for a consumer app | **CRITICAL** (strategic) | H × M | GO/NO-GO gate first; manual-first tracker that feels alive via processing-time data; don't message/measure as if API exists | 0, 4 |
| 4 | Re-engagement after 1–10yr dormancy unbuilt; push dies with device/email | **CRITICAL** | H × H | Email as durable channel; dormant re-onboarding flow; in-app surface as source of truth | 5, 5.5 |
| 5 | PII/compliance exposure with zero revenue; key management undefined | **HIGH** | M × H | External KMS/app key separate from DATABASE_URL; metadata-only vault in v1; audit_log; deletion/export day one | 0, 2 |
| 6 | Distribution unsolved for a 1–10yr purchase; GTM + monetization missing | **CRITICAL** | M × H | GTM workstream: CAC-per-filer, ≥1 renewal-intent channel + institutional partner, trigger detection; written monetization hypothesis | 0 (workstream) |
| 7 | "Submit" architecturally undefined (no USCIS submission API) | **HIGH** | H × M | Define submit = export verified PDF; rewrite Phase 3/4 scope + activation metric | 0, 3 |
| 8 | Expo push correctness + timezone (wrong-day fires; receipt/token gaps; single channel) | **HIGH** | M × H | Physical-device pipeline spike; per-user timezone; idempotent sends on `reminders.status`; in-app fallback; cron alerting | 0, 5 |
| 9 | Bleeding-edge version matrix (SDK 56 / RN 0.85 / React 19 vs HeroUI/Reanimated/Better Auth) | **MEDIUM** (blocking) | M × M | Verify full matrix in Phase 0 before committing timeline | 0 |
| 10 | Drizzle partial-index DDL not emitted (cron/agenda silently degrade to full scans) | **MEDIUM** | M × M | Assert `WHERE` in generated DDL; raw migration + migration test asserting predicate | 2 |
| 11 | Scope too broad for a single-hypothesis MVP | **MEDIUM** | M × M | Cut I-90, file storage, forum/news, multi-language build from validation MVP | 0 (scope) |
| 12 | Monorepo restructure timing conflict + Expo/EAS sharp edges | **MEDIUM** | L × M | Decide Option A in Phase 0; prove one shared Zod type; restructure as first Phase-1 task | 0, 1 |
| 13 | App-store rejection (disclosures, deletion, government-affiliation copy) | **MEDIUM** | M × M | In-app deletion from Phase 1, verified Phase 6; accurate disclosures; copy review | 1, 6 |
| 14 | Dev-build friction (push + secure store don't run in Expo Go) | **LOW** | M × L | Standardize on EAS dev client from Phase 0/1; CI builds dev clients | 0, 1 |

---

## De-risking spikes to run first (priority order)

1. **User-validation sprint** (kill/pivot/proceed) — 30–50 EAD renewers, trust + switching test. ~2 weeks, start day 1.
2. **USCIS case-status GO/NO-GO** — developer portal + public endpoint; expected NO. 2 days.
3. **UPL + I-765 accuracy** — field classification, golden-fixture, written attorney sign-off. 3 days + attorney lead time.
4. **Define "submit"** with counsel. 0.5 day.
5. **Encryption / key-management** decision (external key, not in DATABASE_URL). 0.5 day.
6. **Document-storage** decision (confirm metadata-only). 0.5 day.
7. **Version-matrix** verification (SDK 56 stack). 0.5 day.
8. **Monorepo type-flow** spike (shared Zod, Expo+EAS edges). 0.5 day.
9. **Expo dev-build + push** on a physical device incl. timezone. 1 day.
10. **Drizzle partial-index DDL** check. 0.5 day.

---

## First-week checklist

- [ ] **Day 1:** Kick off the user-validation sprint (recruit 30–50 EAD renewers) AND start the USCIS GO/NO-GO spike — both are the longest-lead items.
- [ ] **Day 1:** Reach out to an immigration attorney for the UPL scope review (lead time); begin mapping I-765 fields mechanical-vs-legal-judgment.
- [ ] **Day 1–2:** Define "submit" (export-PDF vs anything resembling submission) with counsel input.
- [ ] **Day 2:** Build a minimal EAS dev build; deliver one real push to a physical device; verify correct local-day timing.
- [ ] **Day 2–3:** Lock the architecture levers — metadata-only storage, external key-management, monorepo Option A; spike the shared-Zod workspace; verify the SDK 56 version matrix.
- [ ] **Day 3–4:** Restructure into the monorepo (`apps/mobile`, `apps/server`, `packages/shared`); install i18n (en+es) with text-expansion-tolerant layouts; add `eas.json` + `app.config.ts` + three EAS envs.
- [ ] **Day 4–5:** Stand up Railway (Postgres + Hono); scaffold Drizzle schema + first migration; **verify the partial `WHERE` clauses emit** (raw migration if not).
- [ ] **Day 5:** Wire Better Auth + the `user_id` middleware; replace placeholder tabs with the real five-tab spine + `(auth)` stack; build sign-in storing the token in expo-secure-store.
- [ ] **End of week:** Write the three go/no-go memos (USCIS API; UPL/form scope; user-validation interim) — these gate Phase 3/4 scope. **Draft the GTM + monetization-hypothesis one-pager** (the two missing workstreams).
