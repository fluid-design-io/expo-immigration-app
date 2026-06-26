# SPIKE Memo — Form I-765 (EAD) Form-Logic & UPL Boundary

**Date:** 2026-06-22 · **Scope:** v1 = I-765 renewal only · **Status:** Engineering spike, attorney-review-pending

## 1. Current form edition

- **Current/mandatory edition: 03/13/26.** USCIS Forms Updates confirms that starting **June 1, 2026**, only the **03/13/26** edition is accepted. Since today is June 22, 2026, this is the only valid edition.
- The static PDF at `uscis.gov/.../i-765.pdf` was still serving the **08/21/25** edition when fetched (CDN cache lag). The **Part/field structure is identical** between 08/21/25 and 03/13/26, so the schema below is structurally valid — but the app must (a) print the literal string `Form I-765 Edition 03/13/26` on every exported page, and (b) re-verify the live edition on `uscis.gov/i-765` before every release. Treat edition as a config value, never hardcode in UI copy alone.

## 2. Logical steps (the wizard flow)

1. **Reason for applying** (Part 1, Item 1.a/1.b/1.c) — Initial / Replacement / **Renewal**. v1 optimizes Renewal.
2. **Identity & names** (Part 2, Items 1-4).
3. **Address** (Items 5-7, with same-as-mailing toggle).
4. **Biographic & country info** (Items 8-21: A-Number, USCIS Online Acct, gender, marital status, SSN, birth, DOB, I-94, passport).
5. **Arrival & status** (Items 22-26).
6. **Eligibility category** (Item 27 + sub-items 28-31) — the gated legal core.
7. **Document checklist** (Required Documentation, category-aware).
8. **Applicant statement / interpreter / preparer** (Parts 3-5).
9. **Review & verify** (full read-back + disclaimer ack).
10. **Export** signature-ready PDF.

## 3. Field classification: mechanical vs legal-judgment

**Mechanical transcription (safe to auto-fill from vault / copy-forward, user still verifies):** legal name (1.a-1.c), other names (2-4), addresses (5-7), A-Number (8), USCIS Online Account # (9), gender (10), marital status (11), prior-I-765 flag (12), SSN if known (13), country of citizenship/birth (14/15), DOB (16), I-94 number (17), passport details (18-21), SEVIS # (26), contact info (Part 3 Items 3-5), and the applicant's own signature/date (Part 3 Item 7). **This is the retention engine — the 2nd filing becomes near one-tap from these.**

**Legal-judgment (UPL hazard — gate, disclaim, suggest-not-decide, offer route-to-counsel; NEVER auto-decide):**

- **Item 27 Eligibility Category** — the #1 denial/UPL risk (c8 vs a5, c9 vs a3/a5, c33).
- **Item 1.a-1.c Reason for applying** — Renewal vs Initial vs Replacement is a characterization with fee/clock consequences.
- **Item 25 Current Immigration Status / Item 24 Status at Last Arrival** — characterizing one's own status (e.g., "deferred action", "no status").
- **Item 28** (c)(3)(C) STEM OPT eligibility.
- **Item 30** (c)(8) pending-asylum / asylum-clock sub-questions.
- **Item 31.a/31.b** (c)(35)/(c)(36) compelling circumstances + the EVER-arrested/convicted question.
- **Fee vs fee-exemption / I-912 waiver eligibility.**
- **c(33) economic-necessity showing on I-765WS.**
- **Any arrest/criminal-history disclosure.**
- **Whether the companion case (I-589 / I-485 / I-821D) is properly pending.**
- **Filing-timing strategy** given the Oct 30 2025 removal of the auto-180-day extension.

## 4. Required supporting documents — RENEWAL

Assembled per the Instructions' Required Documentation section:

1. Signed Form I-765 (03/13/26 edition).
2. Filing fee per **G-1055** *if applicable* — **c(8) initial/renewal is currently fee-exempt**; **c(9) and c(33) carry fees** unless an I-912 waiver applies. Confirm live.
3. **Copy of last EAD, front and back** (the defining renewal doc). If never issued an EAD: a government photo-ID substitute.
4. Copy of **I-94 / passport / travel document** — **except c(9), which is exempt** from this.
5. **Two identical 2x2 passport-style photos** (white background, glossy, name + A-Number penciled on back).
6. **Category-specific renewal proof:** c(8) = evidence I-589 still pending; c(9) = I-485 receipt/evidence pending; c(33) = **I-821D + I-765WS**.

## 5. How c8 / c9 / c33 differ

| | c(8) Pending asylum | c(9) Adjustment of status | c(33) DACA |
|---|---|---|---|
| Underlying form | Pending I-589 | Pending I-485 | I-821D (DACA) |
| Distinct from | a(5) granted asylum | a(3)/a(5) refugee/asylee AOS | — |
| Fee | Currently exempt | Fee (or I-912) | Fee (or I-912) |
| I-94/passport doc | Required | **Not required** | Via I-821D bundle |
| I-765WS worksheet | No | No | **Required** |
| Special notes | 150-day asylum clock; ABC 60-day box (Part 3 Item 6) | Asylees/refugees must NOT use c9 | Active litigation/policy volatility |

## 6. In-app disclaimer copy

See `disclaimerCopy` — five surfaces: onboarding (not a law firm, no attorney-client relationship), eligibility-category gate (wrong category = top denial cause), pre-export review (you are responsible; "Export" = PDF for you to sign and file yourself), deadline/timing notice (Oct 30 2025 no-auto-extension), and a persistent find-legal-help link (USCIS recognized orgs + EOIR accredited reps).

## 7. Attorney-review checklist

See `attorneyReviewChecklist` — 12 items covering category correctness, reason characterization, companion-case validity, fee/exemption, c(33) worksheet, supporting docs incl. c(9) I-94 carve-out, status fields, criminal-history implications, filing timing, edition currency, cross-field consistency, and honest preparer/interpreter declarations (the app must not silently list itself as preparer).

## 8. Draft form schema

See `formSchemaDraft` — JSON with steps + representative fields, each tagged `classification: "mechanical" | "legal-judgment"`, with `autofillFromVault`, `disclaimer`, `suggestNotDecide`, and category-conditional branches (`hideIf eligibilityCategory == 'c9'` for I-94; `showIf == 'c33'` for I-765WS). **Labeled DRAFT / attorney-review-pending / NOT production.**

## 9. Key engineering implications

- **Edition is config, re-verified per release.** CDN can lag; do not trust a single fetch.
- **The legal/mechanical split maps directly to the PII vault design:** mechanical fields are vault-backed and copy-forward; legal-judgment fields are per-filing, disclaimer-gated, and never inferred.
- **Two category rules need hard conditional branches:** c(9) suppresses the I-94 document requirement; c(33) adds the mandatory I-765WS.
- **"Submit" = export only.** No field, label, or button may imply the app files with USCIS.
- **Out of scope to even suggest in v1:** STEM OPT (c3C), c35/c36 compelling-circumstances — keep these category codes present but non-recommended.

## Sources
- [USCIS — Form I-765](https://www.uscis.gov/i-765)
- [USCIS — Forms Updates](https://www.uscis.gov/forms/forms-updates)
- [Form I-765 (PDF)](https://www.uscis.gov/sites/default/files/document/forms/i-765.pdf)
- [Form I-765 Instructions (PDF)](https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf)
- [Form I-765WS Worksheet (PDF)](https://www.uscis.gov/sites/default/files/document/forms/i-765ws.pdf)

## Draft form_schema (attorney-review-pending)

```json
{
  "_meta": {
    "form": "I-765",
    "edition": "03/13/26",
    "status": "DRAFT — ATTORNEY-REVIEW-PENDING — NOT PRODUCTION",
    "scope": "v1 EAD renewal; representative fields only",
    "uplPolicy": "Fields marked classification:'legal-judgment' must render a disclaimer, must be user-asserted (never auto-decided), and may route to counsel."
  },
  "steps": [
    {
      "id": "reason",
      "title": "Why are you applying?",
      "part": "Part 1",
      "fields": [
        { "id": "reason", "item": "1", "label": "Reason for applying", "type": "radio", "options": ["initial", "replacement", "renewal"], "default": "renewal", "classification": "legal-judgment", "disclaimer": true }
      ]
    },
    {
      "id": "identity",
      "title": "Your name",
      "part": "Part 2",
      "fields": [
        { "id": "familyName", "item": "1.a", "label": "Family Name", "type": "text", "classification": "mechanical", "autofillFromVault": true },
        { "id": "givenName", "item": "1.b", "label": "Given Name", "type": "text", "classification": "mechanical", "autofillFromVault": true },
        { "id": "middleName", "item": "1.c", "label": "Middle Name", "type": "text", "required": false, "classification": "mechanical", "autofillFromVault": true },
        { "id": "otherNamesUsed", "item": "2-4", "label": "Other Names Used", "type": "name-list", "required": false, "classification": "mechanical" }
      ]
    },
    {
      "id": "address",
      "title": "Where do you live?",
      "part": "Part 2",
      "fields": [
        { "id": "mailingAddress", "item": "5.a-5.f", "label": "U.S. Mailing Address", "type": "us-address", "classification": "mechanical", "autofillFromVault": true },
        { "id": "physicalSameAsMailing", "item": "6", "label": "Is your physical address the same as mailing?", "type": "boolean", "classification": "mechanical" },
        { "id": "physicalAddress", "item": "7.a-7.e", "label": "U.S. Physical Address", "type": "us-address", "showIf": "physicalSameAsMailing == false", "classification": "mechanical" }
      ]
    },
    {
      "id": "biographic",
      "title": "About you",
      "part": "Part 2",
      "fields": [
        { "id": "aNumber", "item": "8", "label": "Alien Registration Number (A-Number)", "type": "a-number", "required": false, "classification": "mechanical", "autofillFromVault": true },
        { "id": "uscisOnlineAcct", "item": "9", "label": "USCIS Online Account Number", "type": "text", "required": false, "classification": "mechanical", "autofillFromVault": true },
        { "id": "gender", "item": "10", "label": "Gender", "type": "radio", "options": ["Male", "Female"], "classification": "mechanical" },
        { "id": "maritalStatus", "item": "11", "label": "Marital Status", "type": "radio", "options": ["Single", "Married", "Divorced", "Widowed"], "classification": "mechanical" },
        { "id": "previouslyFiledI765", "item": "12", "label": "Have you previously filed Form I-765?", "type": "boolean", "classification": "mechanical" },
        { "id": "ssn", "item": "13", "label": "Social Security number (if known)", "type": "ssn", "required": false, "sensitive": true, "classification": "mechanical" },
        { "id": "countryOfBirth", "item": "15.c", "label": "Country of Birth", "type": "country", "classification": "mechanical", "autofillFromVault": true },
        { "id": "dob", "item": "16", "label": "Date of Birth", "type": "date", "classification": "mechanical", "autofillFromVault": true },
        { "id": "i94Number", "item": "17", "label": "Form I-94 Number", "type": "text", "required": false, "classification": "mechanical" },
        { "id": "passportNumber", "item": "18", "label": "Passport Number", "type": "text", "required": false, "classification": "mechanical", "autofillFromVault": true },
        { "id": "countryOfCitizenship", "item": "14", "label": "Country of Citizenship/Nationality", "type": "country", "classification": "mechanical", "autofillFromVault": true }
      ]
    },
    {
      "id": "status",
      "title": "Your arrival and status",
      "part": "Part 2",
      "fields": [
        { "id": "lastArrivalDate", "item": "22", "label": "Date of Last Arrival", "type": "date", "required": false, "classification": "mechanical" },
        { "id": "statusAtLastArrival", "item": "24", "label": "Immigration Status at Last Arrival", "type": "text", "classification": "legal-judgment", "disclaimer": true },
        { "id": "currentStatus", "item": "25", "label": "Current Immigration Status or Category", "type": "text", "classification": "legal-judgment", "disclaimer": true },
        { "id": "sevisNumber", "item": "26", "label": "SEVIS Number", "type": "text", "required": false, "classification": "mechanical" }
      ]
    },
    {
      "id": "eligibility",
      "title": "Your eligibility category",
      "part": "Part 2",
      "gate": { "requiresDisclaimerAck": true, "routeToCounselOption": true },
      "fields": [
        {
          "id": "eligibilityCategory",
          "item": "27",
          "label": "Eligibility Category",
          "type": "guided-select",
          "classification": "legal-judgment",
          "disclaimer": true,
          "suggestNotDecide": true,
          "options": [
            { "code": "c8", "label": "(c)(8) Pending asylum applicant", "requiresCompanion": "I-589 pending evidence", "feeExempt": true, "i94Required": true },
            { "code": "c9", "label": "(c)(9) Adjustment of status (pending I-485)", "requiresCompanion": "I-485 receipt / evidence pending", "feeExempt": false, "i94Required": false },
            { "code": "c33", "label": "(c)(33) DACA", "requiresCompanion": "I-821D", "requiresWorksheet": "I-765WS", "feeExempt": false, "i94Required": false }
          ]
        },
        { "id": "c8PendingAsylum", "item": "30", "label": "(c)(8) pending-asylum sub-questions", "type": "group", "showIf": "eligibilityCategory == 'c8'", "classification": "legal-judgment", "disclaimer": true },
        { "id": "c33EconomicNecessity", "item": "I-765WS", "label": "Economic necessity (Form I-765WS)", "type": "worksheet", "showIf": "eligibilityCategory == 'c33'", "classification": "legal-judgment", "disclaimer": true }
      ]
    },
    {
      "id": "documents",
      "title": "Documents to gather",
      "part": "Required Documentation",
      "fields": [
        { "id": "lastEadCopy", "label": "Copy of last EAD (front and back)", "type": "doc-checklist", "classification": "mechanical" },
        { "id": "photos", "label": "Two 2x2 passport-style photos", "type": "doc-checklist", "classification": "mechanical" },
        { "id": "i94Copy", "label": "Copy of I-94 / passport / travel document", "type": "doc-checklist", "classification": "mechanical", "hideIf": "eligibilityCategory == 'c9'" },
        { "id": "companionProof", "label": "Category-specific proof (pending I-589 / I-485 receipt / I-821D)", "type": "doc-checklist", "classification": "legal-judgment", "disclaimer": true },
        { "id": "worksheet", "label": "Form I-765WS", "type": "doc-checklist", "showIf": "eligibilityCategory == 'c33'", "classification": "legal-judgment" }
      ]
    },
    {
      "id": "statementSignatures",
      "title": "Statement and signatures",
      "part": "Parts 3-5",
      "fields": [
        { "id": "daytimePhone", "item": "3", "label": "Applicant Daytime Phone", "type": "phone", "classification": "mechanical" },
        { "id": "email", "item": "5", "label": "Applicant Email", "type": "email", "required": false, "classification": "mechanical" },
        { "id": "abcClassMember", "item": "6", "label": "Salvadoran/Guatemalan ABC class member", "type": "boolean", "showIf": "eligibilityCategory == 'c8'", "classification": "legal-judgment", "disclaimer": true },
        { "id": "applicantSignature", "item": "7.a", "label": "Applicant Signature", "type": "signature", "classification": "mechanical", "note": "Performed by user on the exported PDF" },
        { "id": "interpreterUsed", "label": "Interpreter used?", "type": "boolean", "classification": "mechanical" },
        { "id": "preparerUsed", "label": "Preparer used?", "type": "boolean", "classification": "mechanical", "note": "App must NOT auto-list itself as preparer" }
      ]
    },
    {
      "id": "review",
      "title": "Review and verify",
      "fields": [
        { "id": "reviewAck", "label": "I have reviewed and verified all answers", "type": "ack", "required": true, "classification": "mechanical", "disclaimer": true }
      ]
    },
    {
      "id": "export",
      "title": "Export signature-ready PDF",
      "fields": [
        { "id": "export", "label": "Generate I-765 PDF (edition 03/13/26)", "type": "export", "classification": "mechanical", "note": "Export = user-verified PDF; app does not submit to USCIS" }
      ]
    }
  ]
}
```
