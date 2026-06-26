# SPIKE Memo — USCIS Case-Status API Feasibility

**Date:** 2026-06-22  **Scope:** v1 = I-765 / EAD renewal  **Verdict: NO-GO for v1**

## Question
Is there a real-time USCIS API a *consumer* app can use to look up **any** user's case status by receipt number? Or is the developer portal per-organization OAuth that only returns the org's own/represented cases?

## Answer
It is **per-organization OAuth (client-credentials), gated and representational** — not a public consumer lookup. Build v1 on a manual-entry fallback; treat the API as a later, optional enhancement behind the same data model.

## Findings

### Auth model
- **OAuth 2.0 client-credentials** (machine-to-machine). Client ID + Client Secret are issued per **Developer Team App** when an organization registers on the USCIS Torch platform — they identify the **org**, not the end user.
- Access tokens **expire every 30 minutes**; response includes an expiry timestamp.
- **No end-user auth flow** (no Authorization Code / PKCE). The consumer never authenticates to USCIS, so there is no per-user consent and no token-level binding of a receipt to its rightful owner.
- **Credential/API-key sharing is prohibited** by the Terms of Use.

### Lookup scope — the decisive point
- The API is officially "case status information to USCIS customers and **their representatives** who require regular access," positioned for **law firms / high-volume providers** with **"attorney-in-the-loop" workflows**.
- USCIS does **not** publish an explicit per-receipt ownership ACL, but the **entire access regime** (org vetting, US incorporation, due diligence, demo gating, "representatives" framing) is built for entities acting **on behalf of applicants they represent** — not a consumer app where any user pastes any receipt number.
- For our app: we **cannot assume** we may look up the receipt of a self-service user who is not "represented" by our org. Treating it as an open arbitrary-lookup endpoint is a ToS / program-intent risk.

### Rate limits
- No public hard numbers. USCIS documents "Rate Limits and Throttling" and enforces **per-tenant / per-endpoint-group quotas**; specifics come only in the onboarding packet.
- Implications: cache/refresh tokens (30-min TTL), backoff on 429, prefer **daily per-case cron** over on-demand per-view polling.

### Redistribution / ToS
- Required: **US-incorporated** software org, **Section 508** compliant app, posted **privacy policy**, **public website** for USCIS due diligence, no credential sharing.
- No clean clause authorizing redistribution of case status to arbitrary end users. Surfacing API status to non-represented consumers is **medium-to-high risk**. Our vulnerable audience (DACA/asylum/TPS) raises the bar.

### Access lead time (realistic)
Sandbox build → generate validated sandbox traffic → USCIS **attestation** → signed **affidavit** → **live App Demo** (first-come, **Wed/Thu afternoons only**) → pass demo + due diligence → production keys.
- Long poles: demo-slot scarcity, signature round-trips, due-diligence review.
- **Realistic: weeks to a few months**, and **not guaranteed** for a consumer app. Does not fit v1.

### Paper vs. online coverage
- The public **Case Status Online** website covers both paper and online (IOE/ELIS) receipts; the API's documented scope emphasizes **employment-/family-based receipts supported by online status** and does **not clearly confirm** full paper-filed parity. Assume **online (IOE) coverage is strongest** and paper coverage is **unverified** until tested in sandbox.
- Note: the catalog has only **two** APIs — **Case Status** and **FOIA**. There is **no processing-times API**; processing times are **website-only** (egov.uscis.gov/processing-times).

## Recommendation — Fallback for v1
1. **Manual receipt entry.** Validate format (3 letters + 10 digits; prefixes IOE/EAC/WAC/LIN/SRC/MSC/NBC/YSC) client + server side. Store on `cases.receiptNumber`, `source = "manual"`.
2. **Derive context locally** from the prefix: service center + online-vs-paper hint; infer form = I-765 for v1.
3. **Processing-time context without an API.** Server cron curates/scrapes `egov.uscis.gov/processing-times` (form + category + office) into an internal reference table. Show "median X months; filed Y ago" — **clearly labeled non-authoritative**, with a deep link to official Case Status Online for self-check.
4. **User-logged status** writes `case_status_events` rows (source manual) so the timeline UI ships today.
5. **API-ready seam.** Put sync behind a `CaseStatusProvider` interface; a future approved USCIS API becomes a drop-in writing `case_status_events` with `source = "uscis_api"` — **no schema change**.
6. Pursue org onboarding **in parallel** as v1.x/v2, **not** a v1 blocker.

## Mapping to our schema (no migration needed)
Tables already fit (`docs/DATA-MODEL.md`, lines ~218–238).

**`cases`**
| Column | Source today | Source via future API |
|---|---|---|
| `receiptNumber` | user input (validated) | echoed request param |
| `formCode` | inferred "I-765" | API form type |
| `currentStatus` | user-selected / null | API `statusCode` |
| `currentStatusText` | user note / null | API `statusDescription` |
| `source` | `"manual"` | `"uscis_api"` |
| `lastSyncedAt` | null | token-fetch timestamp |

**`case_status_events`** (append-only timeline)
| Column | Source today | Source via future API |
|---|---|---|
| `status` | user-logged | `statusCode` |
| `statusText` | user-logged | `statusDescription` |
| `occurredAt` | user date / now() | `statusDate` (fallback now()) |
| `raw` | null | full API JSON payload (audit) |

Existing `caseSourceEnum` and the partial-unique receipt index already support both modes. Resolves the open data-model question at `docs/DATA-MODEL.md:415`.

## Sources
- [Case Status API — USCIS Developer Portal](https://developer.uscis.gov/api/case-status)
- [API Catalog — USCIS Developer Portal](https://developer.uscis.gov/apis)
- [FAQs — USCIS Developer Portal](https://developer.uscis.gov/faqs)
- [How to Get Access Tokens with Client Credentials — USCIS](https://developer.uscis.gov/article/how-get-access-tokens-client-credentials)
- [Production Access Process — USCIS Developer Portal](https://developer.uscis.gov/get-started/production-access)
- [Schedule and Prepare for Demo — USCIS Developer Portal](https://developer.uscis.gov/get-started/production-access/demo)
- [Developers: USCIS Case Status API — Parley](https://ai.parley.so/developers-uscis-case-status-api)
- [Processing Times — Case Status Online (USCIS, website-only)](https://egov.uscis.gov/processing-times)