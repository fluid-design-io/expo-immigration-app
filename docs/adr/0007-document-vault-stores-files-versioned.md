# Document vault stores uploaded files with versioned metadata; generated filings are computed on demand

The Document Vault stores the actual uploaded documents (passport, EAD, Permanent Resident Card, I-94, Social Security card, etc.) in Convex file storage behind per-user access control, each with metadata including type, **version**, and expiry date. Generated filing PDFs are **computed in realtime on demand** from the applicant profile + vault rather than persisted as stored artifacts, so a filing always reflects the current data and current form edition.

## Consequences

- Storing immigration documents triggers encryption-at-rest, access-control, retention, breach, and cascading hard-delete obligations — these are now in scope and must be satisfied before public launch (gated by explicit consent; see [ADR-0004](./0004-information-only-no-legal-advice.md)).
- Enforce file size/type caps and a storage budget for stored documents.
- Versioned metadata lets the vault track document supersession (e.g. a renewed EAD replacing the prior one) and feed the reminder schedule from the newest valid document.
- Because filing PDFs are regenerated on demand, there is no stale-PDF cache to invalidate when the profile or form edition changes.
