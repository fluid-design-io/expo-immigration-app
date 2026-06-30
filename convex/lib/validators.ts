import { v } from 'convex/values'

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

const addressValidator = v.object({
	line1: v.optional(v.string()),
	line2: v.optional(v.string()),
	city: v.optional(v.string()),
	state: v.optional(v.string()),
	postalCode: v.optional(v.string()),
	country: v.optional(v.string()),
})

/**
 * The reusable Applicant Profile (CONTEXT.md) — personal/address/eligibility
 * fields that pre-fill future filings. Every field is optional so a profile can
 * be built up incrementally during onboarding and autofilled later.
 */
export const applicantProfileValidator = v.object({
	givenName: v.optional(v.string()),
	familyName: v.optional(v.string()),
	middleName: v.optional(v.string()),
	aNumber: v.optional(v.string()),
	dateOfBirth: v.optional(v.string()),
	countryOfBirth: v.optional(v.string()),
	eligibilityCategory: v.optional(v.string()),
	mailingAddress: v.optional(addressValidator),
})
