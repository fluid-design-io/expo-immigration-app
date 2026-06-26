# Phase-1 Review — Panel Verdict

> Closure review synthesizing four perspectives: the Planner, a skeptical YC partner (CEO/office-hours), a pragmatic engineering manager, and a product design lead. Conflicts are resolved explicitly below — this is not a concatenation.
> Decision: **Phase-1 gate is NOT met.** See the gate section.

## The four perspectives

### Planner — phased build plan
A thorough, dependency-ordered 9-phase plan with a Phase-0 spike battery, a full risk register, and a first-week checklist. Strengths: correctly front-loads the USCIS, UPL, push, storage, and monorepo spikes; exploits documented parallelism (1‖2, 4‖5); keeps the tracker decoupled from the USCIS API. Gap: treats the three timeline-killers as spikes *inside* feature phases rather than hard gates, and carries the full PRD scope (both forms, file storage, forum/news schema, multi-language as "Could") into v1.

### CEO / office-hours — skeptical YC partner
**Verdict:** real pain, clean engineering, but the retention thesis is structurally fragile and GTM is existential — "a feature in search of a wedge, not yet a company."
Top concerns: (1) the north-star is mechanically self-defeating — I-90 renews every 10 years, so ≥25%-in-12mo only works for the I-765/EAD slice, which is smaller and partly politically unstable; (2) Lawfully (6M+ cases, automated status, community) will crush a manual tracker, and CitizenPath/SimpleCitizen out-file on trust — you're beating neither; (3) "free for now" while self-custodying the highest-liability PII has no monetization *hypothesis* at all; (4) distribution is unsolved for a 1–10yr purchase (no CAC, no channel, no trigger detection); (5) form accuracy is an existential trust/liability risk rated only "Medium"; (6) USCIS status is treated as optional but IS the daily-engagement loop; (7) scope is too broad to prove one hypothesis.
Recommendations: run a 2-week validation sprint first; pick ONE wedge (I-765); make USCIS a GO/NO-GO gate; write a monetization hypothesis; reframe accuracy as the product; build a GTM plan with a CAC assumption; cut I-90, file storage, forum/news, multi-language.

### Engineering — pragmatic EM, pre-build feasibility
**Verdict:** stack and data model are sound and buildable; the real risk is product/legal, not platform.
Top concerns: (1) there is no reliable real-time public USCIS status API for this use case — plan as manual-first; (2) encoded form logic is accuracy + UPL liability and is underestimated as "Medium" (no edition-ingestion process, no golden-fixture, no counsel sign-off); (3) "submit" is undefined — there's no third-party submission API, so it's almost certainly export-a-PDF; (4) PII encryption is named but key management is the gap (pgcrypto-with-key-in-DB is theater); (5) Better Auth + Expo + Railway is viable but front-loaded friction; (6) Expo push is fine at scale but has correctness/timezone gaps and shouldn't be the only channel; (7) the monorepo decision must move to Phase 0; (8) the plan buries hard product-validation items as parallel feature work.
Recommendations: three week-1 spikes (USCIS, submit-vs-export, one-form golden-fixture); engage an attorney now; lock key management before any PII; decide monorepo at Phase 0; verify the SDK 56 matrix; add an in-app reminder surface with push as best-effort + fix timezone; redefine metrics that silently assume an API.

### Design — product design lead, plan-stage
**Verdict:** the retention thesis is sound and the schema encodes the loop, but retention is won/lost in three under-specified surfaces: re-engagement, wizard cognitive load, and trust framing.
Top concerns: (1) the 1–10yr re-engagement problem has no design surface and push can't carry it (tokens die) — the north-star is unbuilt; (2) a generic JSONB form is the highest-risk pattern for anxious non-native-English users — reframe to one plain-language decision at a time with confirm-or-edit pre-fill; (3) trust cues are a legal tightrope (credible but never government-mimicking) and currently just a checkbox; (4) multi-language is effectively a "Must" and there's no i18n in the stack; (5) the deadline surface is the emotional core but framed as a passive calendar; (6) the tracker UX changes entirely on the USCIS decision; (7) onboarding must reach first value before asking for sensitive PII.
Recommendations: design the re-engagement + first-value loop first (email as durable channel); reframe the wizard; build a designed trust layer; resolve multi-language now; make the deadline surface a countdown-first "am I safe?"; design the manual tracker to feel alive; treat a11y + plain language as a design input, not a Phase-6 audit.

---

## Explicit conflict resolutions

1. **I-90 in v1? — RESOLVED: drop it.** Planner/eng/design keep both forms; the CEO argues I-90's 10-year cadence cannot prove a 12-month retention thesis and dilutes the cohort. The CEO wins on the product logic — but the schema cost is zero (`application_types` is versioned/immutable), so I-90 returns post-validation. Net: build I-765 only; the panel's "completeness" concern is satisfied without losing future optionality.

2. **File storage in v1? — RESOLVED: metadata-only.** Planner framed it as a live decision; CEO + eng both say metadata-only. The data model already anticipates a null `file_key`, and metadata+expiry fully powers the reminder loop. Defer encrypted file storage (with KMS + signed URLs) until the loop validates. Eng + CEO win; planner's spike collapses to a recorded decision.

3. **USCIS API — spike vs strategic gate? — RESOLVED: strategic GO/NO-GO gate, run first, expect NO.** All four want it early; the disagreement is severity. Eng's near-certain "no usable consumer API" + CEO's "it IS the daily loop" upgrade it from the PRD's "Could" to a gate that runs *before* the wizard. The tracker is designed manual-first and made to feel alive (design) regardless of outcome.

4. **Multi-language — "Could" vs "Must"? — RESOLVED: split the decision.** PRD/planner say "Could"; design says effectively "Must". The expensive, hard-to-retrofit part (i18n infra + string externalization + text-expansion-tolerant layouts) is adopted now; the bounded-but-costly part (full translation) ships as en+es at launch with more languages as a fast-follow. Design wins on infrastructure; the timeline is protected by limiting launch languages.

5. **Repo structure — "Phase 4" vs "Phase 0"? — RESOLVED: Phase 0.** ARCHITECTURE.md says decide at Phase 4, but Phases 1+2 run in parallel sharing Zod types and cannot do so with an undecided structure (eng). Eng wins; the architecture doc's timing is corrected.

6. **Form accuracy / UPL severity — "Medium" vs "Critical"? — RESOLVED: Critical.** PRD and planner rate it M; CEO and eng both argue it's existential in practice (one "this app got my EAD denied" story ends the brand). Upgraded to CRITICAL with an attorney-owned workstream gating Phase 3 and a golden-fixture test as non-negotiable.

7. **"Submit" semantics — RESOLVED in eng's favor (uncontested).** No third-party USCIS submission path exists; "submit" = export a user-verified PDF. This redefines the wizard end-state, the tracker linkage (manual receipt entry, no auto receipt-back), and the activation metric ("complete" = exported, not USCIS-accepted).

8. **Re-engagement + email channel — RESOLVED in design's favor (uncontested, high-leverage).** The north-star return mechanism is in the schema but has no UX and can't run on push alone. Added as an explicit v1 build item (Phase 5.5) with email as the durable channel.

9. **GTM + monetization — RESOLVED in the CEO's favor (uncontested, missing entirely).** "Free for now" is acceptable; "no theory of money ever" plus "no distribution plan for a 1–10yr purchase" is the founder-level red flag. Both added as first-class workstreams.

10. **Scope breadth — RESOLVED: cut to the smallest loop that proves I-765 renewer retention.** Eng + CEO converge: cut I-90, file storage, forum/news build, and multi-language UI build from the validation MVP. The loop to prove is profile → reminder → file → track → return.

---

## The single riskiest assumption (overall)

**That a meaningful share of users will both (a) return for a SECOND filing within 12 months AND (b) trust a free, self-funded app to correctly file the form their legal status and work authorization depend on.** Both halves must hold, and the docs validate neither — the I-90 cohort can't deliver recurrence inside the window, and the "free, no legal advice" posture actively undermines the trust the highest-anxiety moment requires. The reusable-vault moat only pays off on the 2nd filing; if the fast-renewing cohort is too small/unstable, or users won't trust a free tool with high-stakes filing, the moat never gets a chance. This is why a 2-week user-validation sprint must precede the full build.

## Recommended scope decisions (committed)

1. Drop I-90 from the validation v1 (schema unchanged; returns post-validation).
2. Ship the document vault metadata-only; defer encrypted file storage.
3. Make the USCIS case-status API a GO/NO-GO gate run first; design the tracker manual-first.
4. Define "submit" = export a user-verified PDF; rewrite Phase 3/4 scope and the activation metric.
5. Add a dormant-user re-engagement flow with email as the durable channel (Phase 5.5).
6. Adopt i18n infra + string externalization now; ship en+es; full multi-language as a fast-follow.
7. Add a GTM/distribution workstream (CAC-per-filer + ≥1 renewal-intent channel + trigger detection) and a written monetization hypothesis.
8. Move the monorepo (Option A) and key-management decisions to Phase 0.
9. Keep forum/news firmly in v1.1 (schema exists; no build effort now). Treat a11y + plain language as a Phase-0/Phase-3 design input.
10. Run a 2-week user-validation sprint before committing the full timeline.

## Is the Phase-1 gate met?

**No.** The engineering, data-model, and planning artifacts are genuinely strong — the stack is verified, the schema is reviewed, and the build sequence is sound. But three gate conditions are unmet:

1. **The riskiest product assumption is unvalidated.** No evidence yet that the target cohort will trust a free app for high-stakes filing or return for a 2nd filing in 12 months. The user-validation sprint must return *proceed* (or a pivot) first.
2. **Three project-defining unknowns are unresolved:** the USCIS data GO/NO-GO, the UPL/accuracy boundary (no attorney sign-off, no golden-fixture), and the "submit" semantics. Each changes the shape of Phase 3/4 and the success metrics; building before they're locked is building toward capabilities that may not ship.
3. **Two existential workstreams are entirely missing:** GTM/distribution for a 1–10yr purchase, and a monetization hypothesis to justify custodying the highest-liability PII.

The gate becomes met when: the validation sprint returns proceed; the USCIS go/no-go memo, attorney UPL sign-off + I-765 golden-fixture, and the "submit" definition are written; the key-management + monorepo + storage decisions are recorded; the version matrix is confirmed; one real push is delivered with correct local-day timing; and a GTM + monetization one-pager exists. These are exactly the Phase-0 exit criteria in `docs/IMPLEMENTATION-PLAN.md`. Until then, proceed into Phase 0 only — do not commit the full feature timeline.


---

## Adversarial critic — must resolve before build

*An independent skeptic stress-tested the synthesized plan after the panel. Its findings:*

### Must-fix before writing code

- Make a written GOVERNMENT-DATA-REQUEST + threat-model decision BEFORE storing any PII. For DACA/asylum/TPS users this is existential: define your policy on subpoenas/warrants/ICE requests, decide whether to log auditLog.ip at all, and decide whether data minimization (store the LEAST possible, encrypt the structured PII set — DOB/country/name/address/family — not just A-number) is required. This gates the entire data-custody premise and must be resolved with counsel in Phase 0, not Phase 6.
- Resolve the application_documents RESTRICT vs. right-to-erasure conflict (DATA-MODEL line 205 vs. the day-one deletion/export promise) before writing the schema. Decide concretely how account deletion and GDPR/CCPA erasure interact with RESTRICT'd, filing-attached documents and 'immutable' application records. App stores test in-app deletion; ship-blocking if unresolved.
- Lock the UPL/liability ENTITY + insurance posture, not just a one-time attorney scope review: who/what legal entity ships this, is there E&O coverage, what does the ToS liability/disclaimer/arbitration language say. A free, status-critical filing tool with no entity and no insurance is a personal-liability landmine — decide before any wizard code.
- Define and SECURE USCIS developer-portal access on day 1 (request immediately) and treat the GO/NO-GO as gated by access lead time, not a 2-day analysis. If access can't be obtained in the validation window, the tracker is manual-first by default and every metric/message assuming an API must be struck now.
- Encode the official-form-edition handling and the legal-translation-accuracy review as part of the attorney-gated accuracy workstream BEFORE Phase 3, including: golden fixtures across MULTIPLE eligibility categories (c8/c9/c33), a recurring edition-monitoring runbook, and counsel review of the Spanish legal copy (not just the English). One fixture + 'define a process later' is insufficient to gate a filing that controls someone's work authorization.
- Verify the FULL version matrix INCLUDING TypeScript 6.0.3, react-native-reanimated 4.3.1, and heroui-native-pro 1.0.0-beta.5 (a pre-release beta currently in package.json) against SDK 56 / RN 0.85 / React 19 / Better Auth Expo plugin / Hono + Drizzle, on a physical EAS dev build, before committing the timeline. A pre-release UI lib and a brand-new compiler are both single points of stall.
- Build a compensating accuracy-feedback mechanism before launch given that activation='exported PDF' makes USCIS acceptance unobservable. At minimum, a prompted voluntary outcome capture ('Was your filing accepted? Did you get an RFE?') so the in-the-wild rejection rate — the exact signal the UPL risk demands — is not permanently invisible.

### Blind spots (nobody considered)

- POLITICAL/LEGAL THREAT MODEL IS ABSENT. The user base explicitly includes DACA, asylum-pending, and TPS holders (PRD line 59). A self-hosted Postgres of A-numbers + DOB + country-of-birth + addresses + immigration status is a subpoena / ICE-data-request / law-enforcement-warrant target, not just a 'breach' target. The synthesis frames PII purely as breach surface (KMS, signed URLs) and never asks: what is your policy on government data requests, do you log IP in audit_log (you do — auditLog.ip), can you be compelled to hand over who-renewed-what, and does storing this data put users at MORE risk than the paper status quo? This is the single biggest unexamined risk for THIS population and could be a reason not to custody the data at all.
- ENCRYPTION SCOPE IS WRONG, NOT JUST KEY MANAGEMENT. The synthesis fixates on 'pgcrypto key in DATABASE_URL is theater' but only ever encrypts aNumberEnc. The schema stores legalLastName, dateOfBirth, countryOfBirth, nationality, phone, full addresses, employment, and family_members.details as PLAINTEXT. That set is trivially re-identifying and arguably more sensitive in aggregate than the A-number alone. 'Metadata-only vault' does NOT shrink this — the structured PII is the breach payload, and nobody costed encrypting it or accepted the query/index tradeoffs (you can't index an encrypted DOB or country for the 'cases like yours' processing-time feature).
- application_documents.documentId is onDelete:RESTRICT (DATA-MODEL line 205) and the changelog celebrates this as 'archive, don't destroy the filing record.' This DIRECTLY CONFLICTS with the 'account deletion + data export from day one' GDPR/CCPA/app-store promise repeated throughout the plan. A user who attached a document to a filing cannot have that document hard-deleted without violating RESTRICT, and 'soft-delete via archivedAt' is not deletion under GDPR erasure. Nobody reconciled the retention/immutability design with the legal right to erasure — and app stores test deletion.
- NO ACCESSIBILITY/LITERACY REALITY CHECK BEYOND i18n. The audience is 'often non-native English, anxious, phone-first.' en+es i18n is necessary but not sufficient: USCIS forms assume legal-English reading level, and translating a legal-judgment field into Spanish without changing its meaning is itself a UPL/accuracy hazard (a mistranslated 'have you ever been arrested' question is worse than English). Translation quality of LEGAL copy is an accuracy workstream, not a localization checkbox — it should be under the attorney gate, not the design track.
- THE 'FEELS ALIVE' MANUAL TRACKER MAY BE A DARK PATTERN / TRUST KILLER. Showing 'cases like yours typically take X' from PRD processing-time data to an anxious user, with NO real status, risks (a) giving false reassurance when their specific case is stuck, and (b) collapsing trust the moment they discover the app has no more info than they do. The synthesis treats 'feels alive' as pure upside; for this population a confidently-wrong time estimate during a status-anxiety spiral is a retention-negative, possibly harm-positive, event.
- NO ABANDONMENT/MID-FILING-FAILURE PATH. The whole plan optimizes the happy path (file -> track -> return). There's no design for: the user starts the I-765, hits a legal-judgment field they can't answer, and bails. That is the MOST LIKELY outcome for a self-serve legal form, and it's the exact moment a competitor (or a lawyer) wins them. 'Activation = exported PDF' silently treats every abandonment as noise rather than the core funnel leak to instrument and design against.

### Plan gaps (missing tasks/deps/risks)

- No attorney/E&O insurance or liability-entity decision. The plan says 'attorney UPL sign-off' as a 3-day Phase-0 task, but a one-time scope review is not ongoing coverage. Missing: who carries E&O / professional liability, what legal entity ships this, and what the Terms-of-Service liability disclaimer + arbitration clause look like. A free app with no entity and no insurance custodying status-critical filings is personally exposing the founder.
- No incident-response / breach-notification plan despite self-custodying the highest-liability PII for a vulnerable population. State breach laws (CA, etc.) mandate notification; there is no task for a breach runbook, no data-retention/minimization policy beyond 'metadata-only', and no decision on whether to even log auditLog.ip (which itself is sensitive for this group).
- The USCIS GO/NO-GO is budgeted at 2 days but assumes you can even GET sandbox access. developer.uscis.gov org registration + OAuth client approval is a government onboarding process that can take WEEKS, not 2 days. The timebox is for the analysis, not the access lead time — same lead-time-vs-task confusion the plan correctly caught for the attorney but missed here. Add access-request lead time on day 1.
- No 'official current form edition' monitoring as a LIVE operational task, only a Phase-0 'define a process.' USCIS revises I-765 editions and rejects filings on superseded editions. This needs an owned, recurring runbook (who checks uscis.gov, how often, how a new edition becomes a new immutable application_types row, and how in-flight drafts on the old edition are handled) — it's an ongoing liability, not a one-time spike.
- TypeScript ~6.0.3 (devDependencies) is missing from the version-matrix risk entirely. TS 6.0 is extremely new; it gates every shared Zod type in packages/shared and the Better Auth/Drizzle type surfaces. The matrix risk names HeroUI/Reanimated/Better Auth but not the compiler that must type-check all of it. Add TS 6.0 to the Phase-0 matrix check.
- No load/scale or cost model for the cron + push pipeline at the ONE moment it matters: the plan correctly notes 180/90/30/7-day leads, but if acquisition is seasonal (renewal triggers cluster), the daily cron's ≤100-batch/<600-per-sec throttle and the 15-min receipt second-pass have no capacity ceiling stated and no Railway cost projection for a free product.
- No analytics/consent privacy reconciliation. Phase 6 'wire north-star + funnel analytics' for a non-native-English, politically-vulnerable audience needs a privacy-respecting analytics decision (no third-party SDK leaking immigration intent, consent UX, data-residency). Bolting analytics on at Phase 6 conflicts with the day-1 privacy posture and app-store data-safety disclosures.
- Dormant re-engagement (Phase 5.5) depends on EMAIL surviving 1-10 years, but emails die too (abandoned addresses, especially for a population that changes phones/emails/countries). The plan declares email 'durable' without a verification/bounce-handling/multi-channel-fallback design, and never asks the user to confirm a long-lived contact at first filing. The north-star mechanism rests on an unhardened assumption.
- No test strategy for the golden-fixture set itself: one hand-verified I-765 is not coverage. You need fixtures across renewal categories (c8 asylum, c9 AOS, c33 DACA each have different eligibility-code logic), and a process for keeping fixtures correct when the form edition changes. 'Golden-fixture test green' on a single example gives false confidence.
- The activation metric redefinition ('exported a verified PDF', not USCIS-accepted) means you LITERALLY CANNOT MEASURE your core promise — whether filings are correct/accepted. With no receipt-back loop, you are blind to rejection rate, which is the exact signal your UPL/accuracy risk needs. The plan accepts this as unavoidable but adds no compensating mechanism (e.g., voluntary user-reported outcome, prompted 'did USCIS accept it?' follow-up) to detect accuracy failures in the wild.
- Better Auth self-hosted is named but its operational burden is undercosted: password reset email deliverability, session revocation on the dormant-return flow, account-recovery for users who lost both device AND email (common in this population), and rate-limiting auth endpoints. These are Phase-0/1 decisions, not Phase-6 hardening, and the re-onboarding flow (Phase 5.5) collides with them.

### Over-optimism (unrealistic assumptions/estimates)

- The 2-week user-validation sprint to recruit 30-50 EAD/asylum/DACA renewers is wildly optimistic. This is a hard-to-reach, low-trust, often-undocumented-adjacent, politically-frightened population that will be especially wary of a stranger asking them to discuss the filing their work authorization depends on. Recruiting 30-50 QUALIFIED, currently-in-window renewers who will give honest trust/switching signal in 2 weeks, for free, is likely a 4-8 week effort. The single most important gate is the one most likely to slip silently.
- Phase-0 at '6-8 dev-days technical + ~2 weeks validation overlapping' assumes the attorney engagement, USCIS portal access, AND validation recruiting all run cleanly in parallel within ~2 weeks. All three have external dependencies with multi-week lead times (counsel availability, gov onboarding, vulnerable-population recruiting). Realistic Phase-0 calendar time is 4-8 weeks, not 2.
- Phase 3 'renewal clone reopens pre-filled and completes >=50% faster' is asserted as an exit criterion but cannot be measured at build time — there is no second filing 12 months apart during development. The 50%-faster claim is the north-star moat and it's being treated as a checkable exit gate when it's actually a post-launch cohort metric. The exit criterion is unfalsifiable in-phase.
- 'Free for now' + custodying the highest-liability PII + no E&O + no entity decision is treated as a deferrable monetization-hypothesis one-pager. The cost/liability of self-hosting this data (security eng, breach insurance, legal entity, compliance) is real and recurring with ZERO revenue — the runway/burn implication of being a self-funded data custodian for a litigation-and-subpoena-prone dataset is under-weighted as merely a 'theory of money' gap.
- Total estimate (sum of phases) is ~60-75 dev-days of feature work assuming a solo/small team, NONE of which includes the legal lead time, the analytics/privacy infra, the breach runbook, or the form-edition operational tooling that the plan itself adds. The implicit timeline reads as one quarter; with the real external dependencies and the omitted operational workstreams it's closer to two.
- Assuming the metadata-only vault 'fully powers the reminder/retention loop' overstates the value prop. A user can already see their EAD expiry on the card itself; an app that ONLY stores 'EAD expires 2027-03-01' and reminds them is a glorified calendar entry. The synthesis cut file storage for liability (correct) but didn't reckon that doing so guts a chunk of the differentiated 'vault' value the retention thesis leans on — making the validation sprint's bar even higher.
