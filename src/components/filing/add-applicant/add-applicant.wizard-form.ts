import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'
import { applicantProfileShape, profileFormSchema } from '../../../../convex/lib/profileShape'

/**
 * The add-applicant Interview's single-form blueprint (ADR-0013). `defaultValues`
 * is keyed per Interview *section* (one `form.FormGroup` per step); per-section
 * schemas are `.pick()` projections of the shared Zod single source of truth
 * (`convex/lib/profileShape.ts`) so field shape is never re-declared here.
 *
 * Later filing wizards (I-90, I-765) follow this exact module shape: a
 * `wizard-form.ts` with per-section default values + strict per-step schemas + a
 * composed full-form schema, consumed by a host that owns one `useAppForm`.
 */

/** Step 1 — legal name. Reuses the form schema's required given/family names. */
export const nameSectionSchema = profileFormSchema.pick({ givenName: true, familyName: true })

/** Step 2 — identity. Reuses the shared A-Number shape (with its format regex). */
export const identitySectionSchema = applicantProfileShape.pick({ aNumber: true })

/**
 * Full-form schema for the final `form.handleSubmit()`. It composes the section
 * schemas (its input type must match the form's data shape, so a `.partial()`
 * schema is not usable as a form-level validator). The add-applicant Interview
 * has no optional branches; a branching wizard would instead model skipped
 * sections in its `defaultValues`/data type and keep this schema lenient there.
 */
export const addApplicantFullSchema = z.object({
	name: nameSectionSchema,
	identity: identitySectionSchema,
})

/** Per-section default values — the keys are the `form.FormGroup name`s. */
export const addApplicantFormOpts = formOptions({
	defaultValues: {
		name: { givenName: '', familyName: '' },
		identity: { aNumber: '' },
	},
})

export type AddApplicantValues = (typeof addApplicantFormOpts)['defaultValues']

/** The applicant draft the host hands back on completion. */
export type AddApplicantDraft = {
	displayName: string
	profile: { givenName: string; familyName: string; aNumber: string }
}

/** Flatten the per-section answers into a create/update-ready applicant draft. */
export function toApplicantDraft(values: AddApplicantValues): AddApplicantDraft {
	const givenName = values.name.givenName.trim()
	const familyName = values.name.familyName.trim()
	const aNumber = values.identity.aNumber.trim()
	return {
		displayName: [givenName, familyName].filter(Boolean).join(' '),
		profile: { givenName, familyName, aNumber },
	}
}
