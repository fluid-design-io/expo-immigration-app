import { z } from 'zod'

/**
 * The single source of truth for the Applicant Profile shape (CONTEXT.md).
 *
 * This module is PURE Zod — it imports nothing from `convex/server` or
 * `convex/_generated`, so it is safe to import from the React Native bundle as
 * well as from server-only code. The Convex storage validator is derived from
 * `applicantProfileStorage` (see `convex/lib/validators.ts`) and the form
 * validates against `profileFormSchema`, so both stay in lockstep.
 */

/** A reusable US mailing address. Every field is a string. */
export const addressShape = z.object({
	line1: z.string(),
	line2: z.string(),
	city: z.string(),
	state: z.string(),
	postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid US ZIP code'),
	country: z.string(),
})

/** The full applicant profile shape (personal / eligibility / address). */
export const applicantProfileShape = z.object({
	givenName: z.string(),
	familyName: z.string(),
	middleName: z.string(),
	aNumber: z.string().regex(/^A\d{8,9}$/, 'Enter a valid A-Number (e.g. A012345678)'),
	// ISO 'YYYY-MM-DD' date string.
	dateOfBirth: z.string(),
	countryOfBirth: z.string(),
	eligibilityCategory: z.string(),
	// The applicant's primary immigration card — drives the renewal deadline (#5).
	// ISO 'YYYY-MM-DD' for the expiry.
	cardType: z.enum(['ead', 'greenCard']),
	cardExpiry: z.string(),
	mailingAddress: addressShape,
})

/**
 * The lenient, ALL-OPTIONAL storage shape: a profile is built up incrementally
 * during onboarding, so every field (and every nested address field) may be
 * absent. `.partial()` is shallow, hence the explicit nested partial for
 * `mailingAddress`. The Convex storage validator is derived from this.
 */
export const applicantProfileStorage = applicantProfileShape.partial().extend({
	mailingAddress: addressShape.partial().optional(),
})

/**
 * A strict projection of the shared shape used by the profile form. It
 * replicates the form's existing validation intent exactly (so behaviour is
 * unchanged): first/last name are required, the other fields are free text, and
 * the mailing address is narrowed to line1/city/state/postalCode.
 */
const profileAddressSchema = addressShape
	.pick({ line1: true, city: true, state: true, postalCode: true })
	.extend({
		// The form keeps ZIP as free text (current behaviour), so it does not
		// apply the shared shape's friendly ZIP regex.
		postalCode: z.string(),
	})

export const profileFormSchema = applicantProfileShape
	.pick({
		givenName: true,
		familyName: true,
		aNumber: true,
		dateOfBirth: true,
		eligibilityCategory: true,
	})
	.extend({
		givenName: z.string().min(1, 'First name is required'),
		familyName: z.string().min(1, 'Last name is required'),
		// A-Number stays free text in the form (current behaviour); the shared
		// shape's regex documents the expected format but is not enforced here.
		aNumber: z.string(),
		mailingAddress: profileAddressSchema,
	})

export type ApplicantProfileInput = z.infer<typeof applicantProfileStorage>
