import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'
import { applicantProfileShape, profileFormSchema } from '../../../../convex/lib/profileShape'

/**
 * The I-765 (EAD renewal) Interview's single-form blueprint (ADR-0013), built to
 * the exact shape of the add-applicant wizard: `defaultValues` keyed per section
 * (one `form.FormGroup` per step), strict per-step schemas that are `.pick()`
 * projections of the shared Zod source of truth (`convex/lib/profileShape.ts`),
 * a lenient full-form schema for the final submit, and a `getVisibleSteps`
 * branch so a skipped section never blocks completion.
 *
 * The one real branch: choosing the STEM OPT eligibility category — `(c)(3)(C)`
 * — reveals an extra "STEM details" step (degree level + SEVIS ID). Every other
 * category skips that step entirely.
 */

type Option = { value: string; label: string }

/** Step 1 — why the I-765 is being filed. */
export const REASON_FOR_FILING_OPTIONS: Option[] = [
	{ value: 'initial', label: 'Initial permission to accept employment' },
	{ value: 'renewal', label: 'Renewal of permission to accept employment' },
	{ value: 'replacement', label: 'Replacement of a lost, stolen, or damaged card' },
]

/** Step 2 — the eligibility category that classifies the request (Form I-765 item 27). */
export const ELIGIBILITY_CATEGORY_OPTIONS: Option[] = [
	{ value: 'c08', label: '(c)(8) — Pending asylum application' },
	{ value: 'c09', label: '(c)(9) — Pending adjustment of status (Form I-485)' },
	{ value: 'c3c', label: '(c)(3)(C) — STEM OPT extension (F-1 student)' },
	{ value: 'a12', label: '(a)(12) — Temporary Protected Status (TPS)' },
]

/** Step 3 (branch) — degree level for the STEM OPT extension. */
export const DEGREE_LEVEL_OPTIONS: Option[] = [
	{ value: 'bachelors', label: "Bachelor's degree" },
	{ value: 'masters', label: "Master's degree" },
	{ value: 'doctorate', label: 'Doctorate' },
]

/** The eligibility category that reveals the STEM-only branch step. */
export const STEM_ELIGIBILITY_CATEGORY = 'c3c'

/** Step 1 schema — a reason must be chosen (the empty default fails the enum). */
export const reasonForFilingSectionSchema = z.object({
	reasonForFiling: z.enum(['initial', 'renewal', 'replacement']),
})

/** Step 2 schema — an eligibility category must be chosen. */
export const eligibilitySectionSchema = z.object({
	eligibilityCategory: z.enum(['c08', 'c09', 'c3c', 'a12']),
})

/** Step 3 (branch) schema — degree level + a well-formed SEVIS ID (`N` + 10 digits). */
export const stemDetailsSectionSchema = z.object({
	degreeLevel: z.enum(['bachelors', 'masters', 'doctorate']),
	sevisNumber: z
		.string()
		.regex(/^N\d{10}$/, 'Enter your 11-character SEVIS ID (e.g. N0012345678)'),
})

/**
 * Step 4 schema — name + A-Number. Reuses the shared shapes: required given/
 * family names from `profileFormSchema`, and the A-Number's format regex from
 * `applicantProfileShape` (no field shape is re-declared here).
 */
export const aboutYouSectionSchema = profileFormSchema
	.pick({ givenName: true, familyName: true })
	.extend({ aNumber: applicantProfileShape.shape.aNumber })

/**
 * Full-form schema for the final `form.handleSubmit()`. Like the add-applicant
 * wizard, each section is typed as plain strings (so the validator's input
 * matches the form's values shape) and refined to enforce the strict per-step
 * rules — EXCEPT `stemDetails`, which stays lenient because it is skipped for
 * every non-STEM category and must never block submit (ADR-0013).
 */
export const i765FullSchema = z.object({
	reasonForFiling: z
		.object({ reasonForFiling: z.string() })
		.refine((s) => reasonForFilingSectionSchema.safeParse(s).success, {
			message: 'Choose why you’re filing Form I-765',
		}),
	eligibility: z
		.object({ eligibilityCategory: z.string() })
		.refine((s) => eligibilitySectionSchema.safeParse(s).success, {
			message: 'Choose your eligibility category',
		}),
	// Branch field — kept string-typed; the `.superRefine` below requires it ONLY
	// for the STEM OPT category, so a skipped step never blocks submit.
	stemDetails: z.object({ degreeLevel: z.string(), sevisNumber: z.string() }),
	aboutYou: z
		.object({ givenName: z.string(), familyName: z.string(), aNumber: z.string() })
		.refine((s) => aboutYouSectionSchema.safeParse(s).success, {
			message: 'Add your legal name and A-Number',
		}),
}).superRefine((values, ctx) => {
	// STEM details are required ONLY for the STEM OPT category — this mirrors the
	// getVisibleSteps branch, so a skipped step never blocks submit, but a shown
	// one cannot reach Review empty/invalid (e.g. via direct/stack navigation).
	if (
		isStemCategory(values.eligibility.eligibilityCategory) &&
		!stemDetailsSectionSchema.safeParse(values.stemDetails).success
	) {
		ctx.addIssue({
			code: 'custom',
			message: 'Add your STEM degree level and SEVIS ID',
			path: ['stemDetails'],
		})
	}
})

/** Per-section default values — the keys are the `form.FormGroup name`s. */
export const i765FormOpts = formOptions({
	defaultValues: {
		reasonForFiling: { reasonForFiling: '' },
		eligibility: { eligibilityCategory: '' },
		stemDetails: { degreeLevel: '', sevisNumber: '' },
		aboutYou: { givenName: '', familyName: '', aNumber: '' },
	},
})

export type I765Values = (typeof i765FormOpts)['defaultValues']

/** The persisted draft shape. For the tracer it mirrors the wizard's sections. */
export type I765Draft = I765Values

/** The ordered ids of every wizard step (Review is the terminal summary). */
export const I765_STEP_IDS = [
	'reasonForFiling',
	'eligibility',
	'stemDetails',
	'aboutYou',
	'review',
] as const

export type I765StepId = (typeof I765_STEP_IDS)[number]

/** Whether the chosen eligibility category is the STEM OPT branch — `(c)(3)(C)`. */
export function isStemCategory(eligibilityCategory: string): boolean {
	return eligibilityCategory === STEM_ELIGIBILITY_CATEGORY
}

/**
 * The visible steps for the current answers — the single source of truth for the
 * branch. `stemDetails` is included only when the STEM OPT category is selected,
 * so the wizard skips it (and the lenient full-form schema never requires it) for
 * every other category.
 */
export function getVisibleSteps(values: I765Values): I765StepId[] {
	return I765_STEP_IDS.filter(
		(id) => id !== 'stemDetails' || isStemCategory(values.eligibility.eligibilityCategory),
	)
}

/** The next *visible* step after `current`, or `undefined` if `current` is last. */
export function nextVisibleStepId(
	values: I765Values,
	current: I765StepId,
): I765StepId | undefined {
	const visible = getVisibleSteps(values)
	const index = visible.indexOf(current)
	if (index !== -1) {
		return visible[index + 1]
	}
	// `current` is no longer visible (e.g. the STEM step after the category changed
	// away from (c)(3)(C)) — advance to the first visible step after its canonical
	// position so Continue never no-ops.
	const canonicalIndex = I765_STEP_IDS.indexOf(current)
	return visible.find((id) => I765_STEP_IDS.indexOf(id) > canonicalIndex)
}

/** The fields prefilled from the self applicant's saved profile (CONTEXT.md autofill). */
type ProfilePrefill =
	| {
			givenName?: string
			familyName?: string
			aNumber?: string
			eligibilityCategory?: string
	  }
	| null
	| undefined

function isKnownCategory(value: string): boolean {
	return ELIGIBILITY_CATEGORY_OPTIONS.some((option) => option.value === value)
}

/**
 * Merge a saved draft section over its prefilled section, field by field. A draft
 * value wins ONLY when it actually holds something — an empty default string must
 * never clobber a profile prefill, so a partial draft never drops prefilled data
 * (drafts persist every section, untouched ones as `''`).
 */
function mergeSection<T extends Record<string, string>>(
	prefilled: T,
	draft: Partial<T> | undefined,
): T {
	if (!draft) {
		return prefilled
	}
	const merged = { ...prefilled }
	for (const key of Object.keys(prefilled) as (keyof T)[]) {
		const value = draft[key]
		if (typeof value === 'string' && value !== '') {
			merged[key] = value as T[keyof T]
		}
	}
	return merged
}

/**
 * Build the form's initial values: start from the self applicant's saved profile
 * (autofill), then let any previously saved draft win — merged per section so a
 * partial or empty-defaulted draft never drops a prefilled field. Restores the
 * wizard on reload.
 */
export function buildI765InitialValues(
	savedDraft: Partial<I765Values> | null | undefined,
	profile: ProfilePrefill,
): I765Values {
	const base = i765FormOpts.defaultValues

	const eligibilityCategory =
		profile?.eligibilityCategory && isKnownCategory(profile.eligibilityCategory)
			? profile.eligibilityCategory
			: base.eligibility.eligibilityCategory

	const prefilled: I765Values = {
		...base,
		eligibility: { eligibilityCategory },
		aboutYou: {
			givenName: profile?.givenName ?? base.aboutYou.givenName,
			familyName: profile?.familyName ?? base.aboutYou.familyName,
			aNumber: profile?.aNumber ?? base.aboutYou.aNumber,
		},
	}

	if (!savedDraft) {
		return prefilled
	}

	return {
		reasonForFiling: mergeSection(prefilled.reasonForFiling, savedDraft.reasonForFiling),
		eligibility: mergeSection(prefilled.eligibility, savedDraft.eligibility),
		stemDetails: mergeSection(prefilled.stemDetails, savedDraft.stemDetails),
		aboutYou: mergeSection(prefilled.aboutYou, savedDraft.aboutYou),
	}
}

/** Map the per-section answers to the draft persisted to Convex (identity for the tracer). */
export function toI765Draft(values: I765Values): I765Draft {
	return values
}

/** Human label for a stored option value (e.g. for the Review summary). */
export function optionLabel(options: readonly Option[], value: string): string {
	return options.find((option) => option.value === value)?.label ?? value
}
