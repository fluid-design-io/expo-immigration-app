# Re-Architecture Plan — Immigration Renewal Assistant (v2)

> Status: **proposal for ratification.** This treats the current build as a proof-of-concept
> experiment (issues #5–#11 shipped and validated the domain, the Convex/Better-Auth backend,
> the question-first Interview, the pdf-lib preview, and the composition-structure conventions).
> It re-plans the **information architecture, data model, and terminology** around the product
> concept — *not* the current file layout. Companion docs: `PLAN.md`, `CONTEXT.md`, `docs/adr/`.

---

## 0. What the PoC taught us

The experiment worked and is worth keeping structurally: single-backend Convex (ADR-0001),
anonymous-first onboarding with the account gate at the first sensitive action (ADR-0009/0010),
the single-`useAppForm` question-first Interview (ADR-0012/0013), on-demand watermarked PDF
preview on the real USCIS form (ADR-0006/0007), and the module conventions from
`react-composition-structure` (compound namespaces, `*.data.ts` hooks, `index.ts` boundaries).

Three structural mistakes surfaced that this plan corrects:

1. **One draft per `(owner, formType)`.** `filings` is keyed by `by_ownerId_and_formType` with
   `.unique()` — so a second Work Permit (e.g. for a spouse) *overwrites* the first, and a
   filing carries **no `applicantId`**. Multiple-forms-per-applicant is structurally impossible
   today, and prefill is faked by `useSelfApplicantProfile()` scanning for the `self` applicant.
   This is the one load-bearing thing to fix.
2. **The IA exposes the plumbing, not the journey.** Four tabs (Deadlines · Filings · Vault ·
   Account) whose labels don't match what they render (the "Filings" tab shows *case tracking*;
   "Vault" shows *applicants*), Account occupying a whole tab, and Deadlines as a dead-end
   read-only surface. The app reads as technical.
3. **No first-class filing lifecycle.** There is nothing that represents "this application, from
   blank → documents → pay → tracked." Deadlines, the Interview, Documents, and Cases are
   disjoint surfaces the user must mentally stitch together.

---

## 1. The one-line thesis

> **Ship a lifecycle spine (`Application` as a first-class per-person object with a
> Prepare → Documents → Review/Pay → Track journey) behind a Home-first 2-tab shell
> (Home · Documents — Applications live on Home), with plain-language everywhere.**
> The only breaking change is `filings → applications`; everything else is additive.

---

## 2. Terminology (formalize before building — copy touches every surface)

Non-technical, often non-native-English users don't think in form numbers or "filings vs cases."
**Primary label = plain nickname; technical name = quiet subtitle; jargon behind "What's this?".**

| Internal / USCIS | Primary UI label | Subtitle / secondary |
|---|---|---|
| `filings.draft` (in-progress) | **Application** | form nickname · status |
| `filings` model | `applications` table | — |
| I-765 (base) | **Work Permit** | "Form I-765 · EAD" |
| I-90 (base) | **Green Card** | "Form I-90" |
| `filingKind` (modifier) | "renewal" / "replacement" / "New" | — |
| `applicant` | the person's **name** | "You" / "Spouse" / "Child" |
| `case` (post-submission) | **Case status** / **Tracking** | Receipt number |
| Vault / `documents` | **Documents** | — |
| Deadlines | Home **"What's next"** | — |
| A-Number, receipt #, biometrics | (never a bare label) | behind a "What's this?" helper |

**The application label is composed: `{form base} {filingKind}`** — e.g. "Work Permit **renewal**",
"Green Card **replacement**", "**New** Work Permit" (I-765 initial). The base and the kind are
separate data (`formType` + `filingKind`), never a hardcoded "…renewal" string, so all three
situations render correctly.

**Rules:** never render a bare form number as the primary label; one vocabulary used *identically*
across Home cards, list rows, wizard headers, and push notifications; explain *why* we ask for
each thing ("We need this to renew your work permit").

> ✅ **Decided — plain-language-primary with the precise term as subtitle.** `CONTEXT.md`'s
> glossary currently **avoids** "Work Permit"/"Green Card" for legal precision; we consciously
> override that: the plain nickname is the primary label and the precise term ("Form I-765 · EAD")
> is the subtitle. `CONTEXT.md`'s "Avoid: Green Card / Work permit" entries are amended to "Plain
> label primary, precise term as subtitle." This serves the non-technical goal while keeping
> precision one glance away.

---

## 3. Information Architecture

### 3.1 Tab bar — 2 tabs (decided)

**Home · Documents.** Account/settings move to a **header avatar `Toolbar.Button`** (top-right, on
every top-level screen). Deadlines fold into the Home hero + a Home card. **Applications live *on
Home*** — a "My Applications" recency rail → a "See all" browse route (§3.2a), not a tab. A family
manages a handful of applications, not dozens, so Home + one drill-down route is enough.

Why this shape:
- **Documents earns the one non-Home tab** — a document is a *cross-application reusable asset*
  (one passport feeds many filings); it isn't owned by any single application, so it deserves a
  stable home of its own.
- **Applications are actionability-first** — the job is "resume what I was doing," which a Home
  rail (the specific application one tap away) serves better than a tab of a growing list.
- **Account is not work** — header menu (Gmail/banking/TurboTax convention).
- **Deadlines fold into Home** — context for applications, not a destination (resolves the ADR
  conflict, §3.4).

### 3.2 Home = "what do I do next" dashboard

`src/app/(tabs)/(home)/index.tsx`, top-to-bottom. **Two card classes only:** *Action cards* (one
dominant CTA) and *Status cards* (glanceable, tap to drill in). Order = urgency → in-progress → new.

1. **Next-action hero (exactly one, dynamic).** The single most important thing right now, derived
   from deadlines + application stage: *"Finish Maria's Work Permit — Step 3 of 5"* / *"Upload your
   passport"* / *"File by Aug 14 to avoid a gap."* Full-width Action card, one CTA.
2. **Deadlines card** (absorbs the Deadlines tab). The 1–3 nearest File-By dates as timeline rows,
   amber/red urgency, "See all" expands. Actionable ("File by X to keep working"), not a calendar.
3. **My Applications rail → browse route** (§3.2a). Horizontal card rail of individual applications
   (in-progress first, then recently filed); header "See all" → the grouped browse route.
4. **Start a new application card → create route.** The forms as a **ListGroup** (nicknames +
   one-line "who this is for"), feeding the create flow (§5.1).
5. **Case tracking card → Case route.** Active cases with a status chip ("Biometrics" / "Card was
   mailed") from the existing 7-stage enum; "Track a case" → add-receipt/detail route.
6. **Documents-needed nudge (conditional).** Only when required docs are missing: "3 documents
   still needed →".

**Never render an empty card** — collapse it or swap to its create/empty state.

### 3.2a "My Applications" — recency rail + grouped browse (decided)

Applications live on Home (no tab), in two layers:

- **Home rail (actionability-first).** A horizontal card rail of *individual* application cards,
  ordered **in-progress first, then recently filed**. Each card: person name · plain form nickname ·
  status chip · progress hint; tap → the **Journey Hub** for that application (§3.3). Empty state =
  a single "+" card → the new-application flow. This is the "jump back in" surface — the specific
  thing you were doing is one tap away, which for the common single-applicant user *is* the whole
  experience ("Continue your Work Permit renewal — Step 3 of 5").
- **"See all" → browse route** (`(home)/applications/index.tsx`, pushed from the rail header —
  still not a tab). The full list **grouped by person** (You · Spouse · Child) by default, with a
  **`Toolbar.Menu`** to re-group (Person / Form type) and filter (status, form type). Person-primary
  because the product differentiator is managing a *family* on reusable per-person profiles —
  "Maria's applications" ties to Maria's profile + documents and scales with people; form type is
  capped at two and is the axis we're de-emphasizing, so it's a **toggle/filter, not the default
  bucket**.

### 3.2b People — a compact chip row → an Applicant Hub (not a rail)

Applicants (You + dependents) are the reusable-profile asset, so they earn presence on Home — but as
a **compact "People" avatar-chip row** (You · Spouse · **+ Add**), *not* a full card rail. A rail
would compete with the actionability hierarchy (an applicant isn't a "next action") and bloat Home
toward the "dashboard of equal cards" failure. Each chip → an **Applicant Hub**
(`(home)/applicant/[id]`): that person's **profile** (edit), **their applications**, and **their
documents** in one place — the person-level mirror of the Filing Journey Hub. "+ Add" runs
`add-applicant`. This is the applicant-management surface (also linked from the Account menu and the
person-grouped Applications browse), reinforcing "your saved info makes the next filing one tap"
without turning Home into competing rails.

### 3.3 The lifecycle spine — Filing Journey Hub

The highest-value new idea. Each application opens a **Journey Hub** (`applications/filing/[id]`)
that shows four **Stage rows** with derived completeness and a CTA, later stages locked until
earlier complete:

```
Prepare      ●───────  Interview answers        (Prepare% = visible steps × per-section Zod)
Documents    ○───────  Required docs uploaded    (Docs% = requiredDocuments − latest uploads)
Review & Pay ○───────  Watermarked preview → Service Fee → Filing Package   (the ONLY paywall)
Track        ○───────  Enter receipt # → Case status timeline
```

This is what makes the app *feel guided end-to-end* instead of a set of disjoint tools. **Stage is
DERIVED, never stored** (store only a coarse `status`) — prevents stage/status drift.

### 3.4 ADR reconciliation for the merge

The audit flagged that naïvely "merging Deadlines + Filings" could bury the **deadline-as-wedge**
and break the ADR-0010/0011 gate sequencing (value must be felt before any wall). The resolution:
**Deadlines fold into the Home *hero*, which is the first, free, pre-gate element** — so the wedge
leads, not hides. We do **not** merge Deadlines into the payment-bearing Filings surface. Record
this reconciliation in a new IA ADR so it isn't relitigated.

### 3.5 Route map (Expo Router)

```
src/app/
  _layout.tsx                      # unchanged anon-first Stack.Protected shell
  welcome.tsx  sign-in.tsx
  (tabs)/
    _layout.tsx                    # 2 NativeTabs (Home · Documents) + headerRight avatar → (modal)/account
    (home)/
      index.tsx                    # dashboard: hero + Deadlines + My Applications rail + Start-new + Cases
      applications/index.tsx       # "See all" — grouped-by-person browse (Toolbar.Menu regroup/filter)
      applicant/[id].tsx           # Applicant Hub — profile + their applications + their documents
      filing/[id].tsx              # Journey Hub (Prepare→Documents→Review→Track)
      cases/…                      # case list + detail (from Home card / Track stage)
    documents/
      index.tsx                    # "Still needed" checklist + "Your documents" grouped-by-person
      [documentId].tsx             # document detail (view / replace / reassign)
  (modal)/
    new-application/               # pick person → pick form (reuses add-applicant)
    interview/[id].tsx             # SINGLE-HOST wizard keyed by applicationId (§5.2)
    add-applicant/                 # unchanged
    upload/                        # file-first "Tag these" queue + type-first capture (§6)
    review/[id].tsx                # Preview → Service Fee → Filing Package (the paywall)
    account.tsx                    # ex-Account tab, now a modal from the header avatar
    upgrade.tsx                    # unchanged (account gate fallback)
```

Dead surfaces removed: `(tabs)/(deadlines|filings|vault|account)`, `file-i765/`, `file-i90/`,
`test.tsx`, and the `todos` table.

### 3.6 Module structure (`src/components`)

Route files stay **thin wrappers** (`export default () => <Home.Screen/>`); all logic lives in
route-bound domain modules under `src/components/` (the `react-composition-structure` conventions:
one folder stem, `*.screen.tsx` / `*.card.tsx` / `*.context.tsx` / `*.data.ts` / `*.types.ts`
suffixes, a single `index.ts` public boundary, module-local `*.data.ts` wrapping `convex/react`).

```
src/components/
  home/          home.screen · home.hero · people.chip-row · cards/{deadlines,applications-rail,
                 start-new,cases,documents-nudge}.card · home.data
  applications/  applications.browse.screen (grouped-by-person + Toolbar.Menu) · application.card ·
                 new-application/ (create: person→form→situation) · applications.data
                 filing-journey/ — Journey Hub: Stage.{Prepare,Documents,Review,Track} · journey.derive
  applicants/    applicant.hub.screen · applicant.card · profile/ (edit) · applicants.data
  interview/     interview.host (the ONE useAppForm) · interview.context · steps/ · interview.data
                 (per-form blueprints move to convex/forms/*.registry — §5.3)
  documents/     documents.screen (checklist + grouped) · document.row · upload/ (source sheet +
                 tag/queue) · documents.data
  review/        review.screen (Preview → Service Fee → Package) · entitlement.data · review.data
  cases/         case.card · case.status-timeline · case.add-form · cases.data
  deadlines/     deadline.hero · deadline.card · deadlines.data   (consumed by home/)
  account/       account.screen (modal) · account.data
  core/  form/   shared primitives (unchanged)

convex/
  forms/         i765.registry.ts · i90.registry.ts · requirements.ts   (field registry §5.3 + doc reqs)
  applications.ts documents.ts cases.ts purchases.ts account.ts  (+ model/, lib/)
```

Rule of thumb: a module owns a route (or a compound surface) + its data hooks; cross-module use goes
through the `index.ts` barrel only. `deadlines/` has no route of its own — it's a library the
`home/` hero and card consume.

---

## 4. Data model (`convex/schema.ts`)

The single breaking change. Rename `filings → applications`; make each row a first-class
per-applicant instance.

```ts
applications: defineTable({
  ownerId: v.string(),
  applicantId: v.id('applicants'),        // REQUIRED — kills orphan drafts, unblocks multi-form
  formType: filingFormTypeValidator,       // i765 | i90
  filingKind: filingKindValidator,         // initial | renewal | replacement — SET AT CREATE (ADR-0003)
  status: applicationStatusValidator,      // draft | filed | closed — DURABLE milestones ONLY (see below)
  draft: filingDraftValidator,             // ADR-0005 typed discriminated union — NOT v.any()
  paidAt: v.optional(v.number()),          // denormalized mirror; source of truth = `purchases`
  updatedAt: v.number(),
})
  .index('by_ownerId', ['ownerId'])
  .index('by_applicantId', ['applicantId'])
  .index('by_ownerId_and_status', ['ownerId', 'status'])
  // DROP by_ownerId_and_formType. No `caseId` here — the case↔application link is CANONICAL on
  // the case side only (`cases.applicationId`), read via `by_applicationId`; avoids two-way drift.

documents: defineTable({
  applicantId: v.id('applicants'),
  ownerId: v.string(),
  type: documentTypeValidator,
  version: v.number(),
  status: v.optional(v.union(v.literal('uploaded'), v.literal('verified'))), // 'needed' is DERIVED
  originalName: v.optional(v.string()),
  expiryDate: v.optional(v.string()),
  storageId: v.optional(v.id('_storage')),
}) /* indexes unchanged: by_applicantId, by_applicantId_and_type, by_ownerId */

cases: defineTable({
  ownerId: v.string(),
  applicantId: v.optional(v.id('applicants')),
  applicationId: v.optional(v.id('applications')),  // CANONICAL one-way link; null = STANDALONE case
                                                    // (manual receipt tracking, ADR-0008)
  formType: v.optional(caseFormTypeValidator),
  receiptNumber: v.string(),
  currentStatus: caseStatusValidator,               // unchanged 7-stage enum (ADR-0008)
  history: v.array(caseHistoryEntryValidator),
})
  .index('by_ownerId', ['ownerId'])
  .index('by_applicationId', ['applicationId'])

// Entitlement source of truth (ADR-0011) — receipt validation, refunds, restore-across-devices.
purchases: defineTable({
  ownerId: v.string(),
  applicationId: v.id('applications'),     // the Service Fee is per-filing (ADR-0011)
  provider: v.union(v.literal('apple'), v.literal('google')),
  productId: v.string(),
  transactionId: v.string(),               // dedupe / idempotent server validation key
  originalTransactionId: v.optional(v.string()), // restore / family sharing
  status: v.union(v.literal('active'), v.literal('refunded')),
  purchasedAt: v.number(),
  receipt: v.optional(v.string()),         // validated payload (or a storage ref)
})
  .index('by_ownerId', ['ownerId'])
  .index('by_applicationId', ['applicationId'])
  .index('by_transactionId', ['transactionId'])
```

**Decided modeling calls:**
- **`filingKind` is stored + required, set in the create flow** (§5.1) — ADR-0003 mandates carrying
  initial-vs-renewal from day one, and capturing it up front makes the row well-formed and the label
  correct immediately (a derived guess is fragile).
- **`status` stores DURABLE milestones only: `draft | filed | closed`.** These are irreversible
  events (user marks it mailed → `filed`; the linked case reaches Card-Delivered or the user
  archives → `closed`). **"Ready to file" is DERIVED, never stored** (a function of completeness) —
  storing it would drift the moment answers or documents change. The whole **Journey stage is
  derived**: Prepare% (visible steps × per-section Zod), Documents% (`requiredDocuments` vs latest
  uploads), Review (paid?), Track (a linked case exists).
- **Payment has its own source of truth: the `purchases` table** (ADR-0011) — receipt validation
  (idempotent by `transactionId`), provider transaction IDs, a `refunded` status that revokes the
  unlock, and restore-across-devices via `originalTransactionId`. "Is this application unlocked?" =
  a live `purchases.by_applicationId` where `status = 'active'`; `applications.paidAt` is only a
  denormalized mirror. (This is exactly what the paused #10 paywall needs.)
- **The case↔application link is one-directional, canonical on the case** (`cases.applicationId`,
  nullable). `null` = a standalone case (manual receipt tracking, ADR-0008); set = linked to the
  application it came from. Read an application's case via `cases.by_applicationId`. Two atomic
  single-row mutations — `linkCaseToApplication(caseId, applicationId)` and `unlinkCase(caseId)` —
  so there is no two-way state to drift.
- **`documents.status` has no `needed` value** — a needed document is the *absence of a row*. Derive
  the checklist from a pure `convex/lib/requirements.ts` descriptor
  (`requiredDocuments(formType, filingKind, draft)`) minus the applicant's latest uploads by type.
  Zero extra table, no joins (ADR-0001-clean).
- **`draft` becomes a typed discriminated union** keyed by `formType`, built from the same Zod
  single-source as `profileShape` (`.pick()` → `zodToConvex`). Tighten this **in the migration** —
  don't ship `v.any()` "temporarily"; the reshape is the one cheap moment to do it (ADR-0005).
- **Document↔application link stays derived in v1** (by `applicantId` + type). Add an explicit
  `applicationDocuments` M:N table *only if* per-filing (not per-person) evidence attachment becomes
  necessary. Flag, don't build.

---

## 5. Applications & the Interview

### 5.1 Create flow — pick person → pick form → pick situation

`(modal)/new-application/`, three quick taps: (a) choose applicant (or "Add someone new" inline,
reusing `add-applicant`), (b) choose the form (cards with plain nicknames, never a code dropdown),
(c) choose the **situation** — the `filingKind`: *Renew an expiring card* / *Replace a lost or
damaged card* / *First-time* (the last only for I-765; I-90 has no initial). This satisfies the
required `filingKind` at creation, sets the correct label immediately ("Green Card **replacement**"),
and lets the Interview start at the *next* question instead of re-asking the branch (the old
per-form "reason" first step moves here). Requires `applicantId` at creation (no orphan drafts).
Lead with the killer feature: *"We'll reuse Maria's saved info."*

### 5.2 One interview, keyed by application

Collapse the route-per-step `file-i765/` and `file-i90/` into **one single-host
`(modal)/interview/[id]`** (ADR-0013): exactly one `useAppForm`, swapping step components by
visible-step index, keyed by `applicationId` (loads *that application's* draft + *its* applicant's
profile). This kills the `useSelfApplicantProfile()` prefill hack — a spouse's filing prefills from
the spouse. The Journey Hub **aggregates**; the Interview **owns the only form instance** — enforce
in review so the Hub never spawns a second `useAppForm` (the ADR-0013 hazard).

### 5.3 Full form-fill automation — the field registry

Today the PDF fill is a hand-written *subset* map. Full coverage of the real forms (~161 I-765 /
~195 I-90 AcroForm fields, editions rotating) is **not a bigger hand-map** — it needs a different
structure: a **declarative per-form field registry**. One entry per logical answer binds it to
(a) its **Zod shape**, (b) its **Interview step/question**, and (c) its **PDF target(s) + transform**.
One registry then drives validation, the Interview, the completeness check, *and* the PDF fill — the
ADR-0005/0012/0013 "the blueprint defines the data model" principle taken to completion.

```ts
// convex/forms/i765.registry.ts (illustrative)
{ key: 'aboutYou.aNumber',
  zod: aNumberShape,
  step: 'aboutYou',
  pdf: [{ field: 'Page2[0].Line7_AlienNumber', tx: aNumberToComb },   // one logical value →
         { field: 'Page7[0].Line7_AlienNumber', tx: aNumberToComb }], // many PDF fields (page headers)
  requiredWhen: () => true }
```

How full coverage becomes tractable — and survives edition changes:
1. **Author the registry with build-time AI assistance; fill 100% deterministically at runtime.**
   Feed an LLM the PDF field names + extracted nearby labels + the Interview data shape; it *proposes*
   bindings; a human verifies; the committed registry is plain, deterministic code. **No LLM ever
   touches fill-time** — a legal form must be reproducible and correct, never hallucinated.
2. **Full data ≠ ask everything.** Reach coverage via **profile/vault autofill** (identity, address,
   A-Number, DOB — the differentiator) + the **Interview** for branching/decision fields + a short
   **"Complete your form" pass** before Preview that surfaces any still-required fields as a grouped
   mini-form. The registry's `requiredWhen(formType, filingKind, draft)` is the single source of what
   is required — the *same* descriptor that drives the Documents checklist (§6).
3. **Transforms & derivations live in the registry:** combs (zero-padded A-Number), checkbox value
   maps, page-repeated headers (one value → many fields), computed fields ("same as mailing address",
   today's date), enum→label.
4. **Verification harness (CI):** a golden-fill test per form asserts every mapped field from known
   answers; a **coverage report** lists mapped vs unmapped form fields; an **edition-drift check**
   diffs the current-edition field names against the registry keys and **fails the build** when USCIS
   ships a new edition whose fields moved (ADR-0006 editions rotate) — breakage caught at build, not
   by a user.

This is a **dedicated workstream** (its own phase), not a quick pass — but it's how full coverage
becomes maintainable instead of a static map that silently rots.

---

## 6. Documents center (tax-app pattern)

**Checklist-driven, grouped-by-person, per-document status** — the strongest pattern from
TurboTax/H&R Block.

- **Capture is a unified source sheet, not a big form** (TurboTax pattern). "Upload" (from a
  checklist row, a document's "Replace," or Home) opens a compact sheet with every source:
  **📷 Scan** · **🖼️ Photo library** · **📄 Files / PDF** · **♻️ Use an existing document** (attach
  one already in the Vault — e.g. a passport already uploaded for Maria — no re-upload). **Scan is
  the hero:** a VisionKit-style document scanner (auto edge-detect, crop, enhance, multi-page → one
  PDF), since most users photograph physical cards/notices. *(Native module → needs a dev-client
  rebuild; same tradeoff class as the PDF-viewer decision.)*
- **Two entry modes around that sheet** (`(modal)/upload/`):
  - **Type-first** ("Upload a required document"): from a checklist row with Type + Applicant
    pre-filled → straight to the source sheet.
  - **File-first** ("Add documents"): pick many → a **"Tag these" queue** where each item needs
    **Type + Applicant** before "Save all".
  - Type + Applicant **required to save** (never an untagged pile); re-upload = new `version` ("Upload
    a newer copy"), never overwrite; optional `expiryDate` behind a "Details" disclosure.
- **Documents tab, two sections:**
  - **"Still needed"** (top) — the requirement-derived checklist, each row an inline Upload deep-link.
  - **"Your documents"** — grouped **ListGroup by person**, rows with thumbnail → plain type name →
    "Uploaded Jun 12 · Expires Aug 2026" (amber within 90 days) → status chip → overflow (View /
    Replace / Reassign / Delete).
- Empty states instruct ("We'll list what each application needs and keep them safe here"); the
  "still needed" list is driven by *actual selected applications*, never a hardcoded generic list.

---

## 7. How each of your six goals is satisfied

| Your goal | How this plan delivers it |
|---|---|
| **1. Multiple forms per applicant** | `applications` table: `_id`-keyed, required `applicantId`, durable `status`, stored `filingKind`; drop the unique index. Create = pick person → pick form → pick situation. |
| **2. Upload as a modal that tags + links** | `(modal)/upload/` with required Type + Applicant, file-first & type-first modes. |
| **3. Better document UI (tax-app)** | "Still needed" checklist (derived) + "Your documents" grouped-by-person, thumbnails, versioning, expiry, bulk "Tag these". |
| **4. Remove Account tab → Toolbar.Button** | Delete the tab; header avatar → `(modal)/account` on every top-level screen. |
| **5. Merge Deadlines+Filings; tracking & create as cards → routes** | Home dashboard: deadlines in hero + card; Applications, Start-new (forms ListGroup), and Case-tracking as cards → routes. |
| **6. Simpler, less technical, a Home** | Home-first IA, one hero per screen, plain-language glossary, progressive disclosure, familiar ListGroup/Card grammar, the guided Journey Hub. |

---

## 8. ADR changes

- **Amend ADR-0013** — the single-host wizard now lives in a modal keyed by `applicationId`; note
  the collapse of route-per-step `file-i765`/`file-i90` into one `interview/[id]`; reiterate the
  "exactly one `useAppForm`" guard (the Journey Hub must not create a second).
- **Amend ADR-0005** — `applications.draft` is now the typed discriminated union (no longer a
  `v.any()` tracer).
- **New ADR — Information Architecture:** the 2-tab shell (Home · Documents) with Applications on
  Home (recency rail → grouped-by-person browse), Account-as-header-button, and Deadlines folded
  into the Home hero — with the reconciliation in §3.4 (deadline hero is the first free pre-gate
  element, so ADR-0010/0011 sequencing holds).
- **New ADR — Filing lifecycle:** the `Application` object + Journey Hub (Prepare → Documents →
  Review/Pay → Track), stage *derived* not stored, Review/Pay as the sole paywalled stage.
- **Amend `CONTEXT.md` glossary** per §2 (plain-label-primary; base + `filingKind` modifier).
- **Amend ADR-0009 (`onLinkAccount` backfill) — this DOES change.** The anon→credentialed migration
  must re-own **every `ownerId`-scoped table**: `applicants`, `documents`, **`applications`**, and
  **`cases`** (a user can prepare an application *and* start manual case tracking while anonymous).
  Today's `migrateAnonymousOwner` (#6) only re-owns `applicants` + `documents` — it's already
  incomplete and must be extended. `purchases` are post-account by construction (payment is gated
  behind the account, ADR-0010/0011), so they never need backfill. Re-own by rewriting `ownerId`
  from the anon token identity to the credentialed one across all four tables in one mutation.
- **No change needed:** ADR-0003 (honored by stored `filingKind`), ADR-0006/0007 (docs stay
  applicant-scoped + versioned; PDFs stay on-demand), ADR-0010/0011 (gate sequencing preserved by
  §3.4; the new `purchases` table *implements* the ADR-0011 Convex entitlement source of truth).

---

## 9. Phased migration from the PoC

- **Phase 0 — clean reset (decided).** As a PoC with disposable data, do a **clean cutover**: new
  `applications` schema, drop `filings`/`todos`, delete `test.tsx`. No `@convex-dev/migrations`
  backfill, no ambiguity. (If real anonymous drafts ever must survive, the widen → backfill → narrow
  path is the fallback.)
- **Phase 1 — schema + backend.** `applications`/`documents`/`cases` reshape; `createApplication`,
  `loadApplication`, `saveDraft(byId)`, `listApplications`, `listByApplicant`;
  `convex/lib/requirements.ts` pure descriptor. Delete `todos`.
- **Phase 2 — wizard repoint.** `interview/[id]` single-host; contexts keyed by `applicationId`;
  remove `useSelfApplicantProfile` hack; typed `filingDraftValidator`.
- **Phase 2b — field registry + full form-fill (dedicated workstream, §5.3).** Per-form registry
  (Zod + step + PDF binding); build-time AI-assisted authoring; profile autofill + "Complete your
  form" pass; golden-fill + coverage + edition-drift CI checks. Can run in parallel with Phase 3+.
- **Phase 3 — IA shell.** 2-tab layout (Home · Documents); Home dashboard + hero + People chip row +
  My Applications rail + browse route + Applicant Hub; header avatar; `(modal)/account`.
- **Phase 4 — Journey Hub + Review/Pay.** `filing/[id]` stage spine; `(modal)/review/[id]` Preview →
  Service Fee gate (dovetails with the paused issue #10).
- **Phase 5 — Documents center.** Unified capture source sheet (Scan / Library / Files / Use
  existing) with a document scanner; `(modal)/upload/` file-first + type-first; Documents tab
  checklist + grouped-by-person, thumbnails, versioning, expiry.
- **Phase 6 — cleanup.** Remove dead tab folders, `test.tsx`; confirm no lingering
  `by_ownerId_and_formType` references.

---

## 10. Risks & open decisions

**Decisions (ratified):**
1. ✅ **Terminology** — plain-language-primary with the precise term as subtitle (§2).
2. ✅ **Migration** — clean reset (§9, Phase 0).
3. ✅ **Tab bar** — 2 tabs (Home · Documents); Applications live on Home as a recency rail → a
   grouped-by-person "See all" browse route with a `Toolbar.Menu` regroup/filter (§3.1, §3.2a).

**Still open (minor):**
- Confirm the default browse grouping is **by person** (form-type as a Toolbar.Menu toggle), vs
  your original form-type-first idea. Recommendation: person-primary.

**Risks:**
- `filings → applications` is the one breaking change; audit `.unique()` / `saveDraft` / the wizard
  contexts before narrowing.
- Backfill ambiguity for owners without a single unambiguous `self` applicant — guard or reset.
- Second-form-instance regression — the Journey Hub aggregates; the Interview owns the only form.
- Requirements checklist must be driven by *actual* selected applications, never a hardcoded list.
- Keep `review/[id]` Service Fee strictly downstream of the free account gate; Preview stays free +
  watermarked; Service Fee itemized separately from the USCIS Filing Fee; checkout copy never
  implies we file or guarantee approval (ADR-0004/0011).
- Non-destructive re-upload — new `version`, keep history, "Upload a newer copy," never overwrite.
