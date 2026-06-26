# PII Threat-Model & Minimization Design — I-765/EAD App (v1)

**Audience served:** DACA, asylum, and TPS holders — a population where a data breach or a government data demand can mean detention, deportation, or harm to family abroad. The design bar is therefore higher than ordinary consumer PII: assume an adversary who can compel the hosting provider, seize a backup, or serve the company directly.

**Decision being specified:** metadata-only vault + app-layer encryption of structured PII.

---

## 1. Threat model (who we defend against)

| Adversary | Capability | Our control |
|---|---|---|
| Database/backup compromise | Reads ciphertext + anything in `DATABASE_URL` | App-layer AES-256-GCM with **KMS-held key separate from `DATABASE_URL`** → DB alone yields no plaintext |
| Hosting/infra legal demand (Railway/storage) | Subpoena served on infra provider | Field encryption + app-held key means infra provider physically cannot produce plaintext; process must come to us, where we can contest |
| Government / ICE request to us | Subpoena/warrant/voluntary ask | Lawful-process policy, minimization, user notification, transparency (§5) |
| Network attacker | MITM | TLS in transit (already in ARCHITECTURE) |
| Another user / broken authz | Cross-tenant read | Every query scoped by `user_id` (already in ARCHITECTURE); revisit RLS if DB ever exposed to >1 service |
| Re-identification via "cohort" features | Indexed plaintext DOB/country | Do **not** build cohort matching on PII in v1 (§3) |

---

## 2. Exactly which fields to encrypt at the app layer

Encrypt (AES-256-GCM, app layer, per-field ciphertext + IV + auth tag + key version):

- **`applicant_profile`**: `legal_first_name`, `legal_middle_name`, `legal_last_name`, `date_of_birth`, `country_of_birth`, `nationality`, `a_number_enc` (already), `phone`.
- **`addresses`**: `line1`, `line2`, `postal_code`. (Leave `city`/`state`/`country` plaintext only if a non-PII need exists; default is encrypt line1/line2/postal which are the identifying parts.)
- **`employment_history`**: `employer`, `job_title` — *if collected at all in v1 (prefer to defer, see §6).*
- **`family_members`**: `first_name`, `last_name`, `date_of_birth`, `details` (JSONB — encrypt whole blob; it carries dependents' PII).
- **`documents`**: `file_name`, `notes` (filenames leak identity, e.g. "asylum_grant_2019.pdf").
- **`cases`**: `receipt_number` (ties the person to a specific USCIS case).
- **`answers` JSONB on `applications`**: contains the full form's PII. Encrypt at rest as an opaque blob OR keep PII out of it by referencing profile fields. (See index tradeoff below — encrypting `answers` kills the GIN index.)

Do **NOT** encrypt: `display_name` (pseudonymous by design), enums (`preferred_language`, `status`, `doc_type`), dates that drive logic without identifying (e.g. `expiry_date` is borderline — see tradeoff), IDs, timestamps. Keep these queryable.

`countryOfBirth` and `nationality` should be **text, encrypted** rather than an enum, so the database catalog itself doesn't reveal the distribution of national origins across the user base.

### Query/index tradeoffs this creates

Field-level encryption makes a column **opaque** to SQL — no `WHERE`, no `ORDER BY`, no index, no `LIKE`, no range query. Consequences:

- **No "cases like yours" / cohort feature on encrypted fields.** Cannot index/group by `date_of_birth`, `country_of_birth`, or `nationality`. This is an accepted, deliberate loss — for this population, an indexable national-origin column is itself a liability. If cohort matching is ever wanted, derive **coarse non-PII buckets at write time** (e.g. `age_band`, `form_code`) and index *those*, never the raw value.
- **`answers` GIN index (DATA-MODEL L197) is lost** if we encrypt the blob. Mitigation: keep form *answers* split — store PII answers encrypted, keep non-PII structural answers (which step, which form version, non-identifying selections) queryable. For v1 (single form type, per-user access only) we don't actually need to query inside another user's `answers`, so encrypting it costs little.
- **`expiry_date` must stay plaintext** — it drives `documents_expiry_idx` and the entire reminder cron. It's low-identifying on its own; keep it.
- **`receipt_number` encrypted** breaks `cases_user_receipt_idx` (the partial-unique dedupe). Mitigation: store a **keyed HMAC** of the receipt number as a separate indexed column for uniqueness/lookup, encrypt the displayable value. (HMAC = deterministic, equality-searchable, not reversible.) Apply the same HMAC trick to A-number if you ever need dedupe on it.
- General rule: when you need *equality lookup* on an encrypted field, add a **blind index** (keyed HMAC) column; when you need *range/sort*, you cannot — redesign the feature.

---

## 3. Key management (recommendation)

**Use an external KMS with envelope encryption. Do NOT use pgcrypto with the key in `DATABASE_URL`.**

- Root CMK in AWS KMS (or Cloudflare). API fetches and decrypts a **data-encryption key (DEK)** at boot; DEK lives only in process memory.
- App encrypts/decrypts fields in the Hono layer before insert / after select.
- KMS credentials + DEK material live in a secret store granted **only to the API service**, deliberately **separate from `DATABASE_URL`**. DB access alone never yields plaintext.
- Store key **version** per field to allow rotation and lazy re-encryption without downtime.
- **Per-user DEK** (or per-user salt deriving the DEK) is strongly preferred because it enables **crypto-shredding** for erasure (§4): destroy one user's key → that user's ciphertext is permanently unrecoverable, even in backups.

Why not pgcrypto-with-key-in-connection-string: a leaked `DATABASE_URL`, a stolen backup, or a demand served on the DB host then yields *both* ciphertext and key — there is effectively no encryption against the threats that matter for this population.

---

## 4. Account deletion / erasure ↔ RESTRICT + immutable applications (SHIP-BLOCKER — resolved)

**The conflict:** GDPR/CCPA erasure requires deleting personal data on request, but `application_documents.document_id` is `ON DELETE RESTRICT` and applications are described as "immutable." A user who has filed cannot currently be fully erased. **This blocks ship.**

**Resolution — crypto-shredding + scoped retention (retain structure, never PII):**

1. **Reframe "immutable."** Immutable means the *audit trail and structural record* (the application row, the M:N link) is preserved — **not** that PII is retained. PII is always erasable.
2. **On account deletion:** hard-delete everything that CASCADEs (already wired on `*.user_id`). For anything that must structurally remain, **crypto-shred**: destroy the user's per-user key so all their AES-GCM ciphertext becomes permanently unreadable.
3. **Change `applicationDocuments.documentId` from `RESTRICT`** so the document can be shredded in place — tombstone the metadata row, but the bytes (object storage) and the key are gone. The filing's structural integrity survives without readable PII.
4. **`answers` JSONB:** deleted with the application (v1 default) or crypto-shredded.
5. **v1 default policy: deleting the account hard-deletes the user's applications** (CASCADE on `applications.user_id` already exists). Because "submit" = a PDF the user already has on their device, **we can keep nothing.** The `RESTRICT` only ever protected shared-document integrity, which crypto-shred now covers.
6. Forum authorship still anonymizes to a tombstone (already designed).
7. **Erasure SLA: 30 days including backups.** Backups age out via the retention window; crypto-shred makes any lingering backup ciphertext unreadable *immediately*, closing the backup gap that normally defeats "delete me."
8. **Erasure vs. restrict-of-processing:** if a user wants processing restricted (not full delete) — e.g. an active case — offer that as a distinct state, but default the destructive path to full crypto-shred.

---

## 5. Government-data-request policy (subpoena / warrant / ICE)

- **Require lawful process.** Subpoena/court order for metadata; judicial **warrant** for content (names, DOB, A-number, addresses, documents, answers).
- **No voluntary cooperation with ICE/DHS** absent valid legal process. Informal/voluntary requests are refused and escalated to counsel. Staff trained on this.
- **Minimization is the primary defense:** you can't be compelled to produce what you never collected or already purged. Short IP TTL, metadata-only docs, and deferred PII collection (§6) all shrink the producible set.
- **Encryption shifts the demand to us.** Because keys are app-held, a demand on Railway/storage yields ciphertext only — process must come to the company, where it can be legally contested. This is a feature, not an accident.
- **Narrow production:** only the specific named records, never bulk.
- **User notification** before disclosure unless a gag order legally prohibits; track and challenge gag orders.
- **Transparency report:** publish counts of requests received/challenged/complied.
- **Have the runbook + legal-hold process documented before the first request arrives.**

---

## 6. Should we log `audit_log.ip` for this population? — **log_short_ttl**

An IP address is a geolocation + ISP + (with a subpoena) a physical-address breadcrumb for someone who may be undocumented or fleeing persecution. Retained indefinitely, it is one of the highest-risk fields we hold relative to its product value.

**Recommendation: do not store raw IP long-term.** Options, in order of preference:
- **Best:** don't log IP at all in `audit_log`; rely on `actor_user_id` + action + timestamp for the compliance/incident-response purpose, which IP doesn't materially improve.
- **If a security need is shown** (abuse detection, account-takeover forensics): store a **salted hash** of the IP, or a coarse truncation, with a **short TTL (e.g. 7–30 days), then auto-purge.** Never keep raw IP indefinitely.

This both reduces breach impact and shrinks what any government request can reach.

---

## 7. Data-minimization plan (concrete)

1. **Collect only I-765 fields in v1.** Each new PII field must answer "which box on the form does this fill?" Defer `employment_history`, `marriage_certificate`, most of `family_members` until a form needs them.
2. **Metadata-only vault for v1** (resolves DATA-MODEL open question L416): `documents.file_key` stays NULL; track `doc_type` + `expiry_date` only. This still powers the full reminder/retention loop while holding **zero immigration files**. Defer encrypted file storage until a feature truly needs the bytes.
3. **Never collect SSN.** A-number optional to start a draft; required only at PDF export.
4. **Lazy PII collection.** Don't gather DOB/country/nationality at signup; collect at the filing step that needs them so an abandoned account holds near-zero PII.
5. **Forum is fully pseudonymous** — only `display_name` touches forum tables; enforce at the API that forum queries never read `applicant_profile`.
6. **No PII cohort feature in v1** (see §2). If wanted later, index derived non-PII buckets only.
7. **Strip USCIS payloads:** persist only derived status from `case_status_events.raw`; drop PII-bearing fields.
8. **Explicit retention/purge schedule:** `audit_log` ~12 months; soft-deleted/archived rows purged on schedule; IP short TTL (§6).
9. **Redact logs:** ensure request logging never captures `answers`, A-number, or addresses; file bytes already bypass the API via signed URLs.

---

## Schema changes this memo requires

- Encrypt the §2 field set (currently only `a_number_enc` is encrypted).
- Add blind-index (HMAC) columns where equality lookup is needed on encrypted fields (`receipt_number`, optionally A-number).
- Change `applicationDocuments.documentId` `RESTRICT` → support crypto-shred / tombstone deletion.
- Make `audit_log.ip` nullable/optional and add a purge job (or drop the column).
- Per-user key derivation to enable crypto-shredding.
- Confirm metadata-only vault: `documents.file_key` NULL in v1.