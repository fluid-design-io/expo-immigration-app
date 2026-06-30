import { zodToConvex } from 'convex-helpers/server/zod4'
import { type Infer, v } from 'convex/values'
import { applicantProfileStorage } from './profile-shape'

/** How an applicant relates to the account holder (see ADR-0009). */
export const relationshipValidator = v.union(
	v.literal('self'),
	v.literal('spouse'),
	v.literal('child'),
)

/** Kinds of document held in the Document Vault (CONTEXT.md). */
export const documentTypeValidator = v.union(
	v.literal('passport'),
	v.literal('ead'),
	v.literal('greenCard'),
	v.literal('i94'),
	v.literal('ssnCard'),
	v.literal('other'),
)

/**
 * The reusable Applicant Profile (CONTEXT.md) — personal/address/eligibility
 * fields that pre-fill future filings. Derived from the single Zod source of
 * truth (`applicantProfileStorage`) so the storage validator can never drift
 * from the form. Every field is optional so a profile can be built up
 * incrementally during onboarding and autofilled later.
 */
export const applicantProfileValidator = zodToConvex(applicantProfileStorage)

export type ApplicantProfile = Infer<typeof applicantProfileValidator>
