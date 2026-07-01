import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'
import { applicantProfileShape, profileFormSchema } from '../../../../convex/lib/profileShape'

/**
 * The I-90 (green-card renewal/replacement) Interview's single-form blueprint
 * (ADR-0013), built to the same shape as the I-765 wizard: `defaultValues` keyed
 * per section (one `form.FormGroup` per step), strict per-step schemas projected
 * from the shared Zod source of truth, a full-form schema for the final submit,
 * and a `getVisibleSteps` branch.
 *
 * Two branches: the reason for filing — **renewal** vs **replacement** —
 * reveals a replacement-reason step; and a critical guardrail — a **conditional**
 * (2-year) resident cannot *renew* via I-90 and is routed to a Form I-751
 * off-ramp instead of a filing.
 */

type Option = { value: string; label: string }

/** Step 1 — renewal vs replacement (Form I-90 Part 2). */
export const REASON_FOR_FILING_OPTIONS: Option[] = [
	{ value: 'renewal', label: 'Renew my card (expiring or expired)' },
	{ value: 'replacement', label: 'Replace my card (lost, stolen, damaged, or changed)' },
]

/** Step 2 — the resident type that drives the I-751 guardrail. */
export const RESIDENT_TYPE_OPTIONS: Option[] = [
	{ value: 'tenYear', label: 'Permanent resident (10-year card)' },
	{ value: 'conditional', label: 'Conditional resident (2-year card)' },
]

/** Step 3 (branch) — why a replacement is needed. Fee is $0 for the last two. */
export const REPLACEMENT_REASON_OPTIONS: Option[] = [
	{ value: 'lost', label: 'Lost, stolen, or destroyed' },
	{ value: 'damaged', label: 'Mutilated or damaged' },
	{ value: 'nameChange', label: 'My name or biographic info changed' },
	{ value: 'incorrectData', label: 'Incorrect data (my error)' },
	{ value: 'neverReceived', label: 'Card was issued but I never received it' },
	{ value: 'uscisError', label: 'Card has incorrect data due to a USCIS error' },
]

/** The resident type that triggers the I-751 guardrail on a renewal. */
export const CONDITIONAL_RESIDENT = 'conditional'

/** Replacement reasons USCIS charges no filing fee for. */
const FEE_EXEMPT_REPLACEMENT_REASONS = new Set(['neverReceived', 'uscisError'])

/** Step 1 schema — a reason must be chosen. */
export const reasonSectionSchema = z.object({
	reasonForFiling: z.enum(['renewal', 'replacement']),
})

/** Step 2 schema — a resident type must be chosen. */
export const residencySectionSchema = z.object({
	residentType: z.enum(['tenYear', 'conditional']),
})

/** Step 3 (branch) schema — a replacement reason must be chosen. */
export const replacementReasonSectionSchema = z.object({
	replacementReason: z.enum([
		'lost',
		'damaged',
		'nameChange',
		'incorrectData',
		'neverReceived',
		'uscisError',
	]),
})

/**
 * Step 4 schema — name + A-Number. Reuses the shared shapes: required given/
 * family names from `profileFormSchema`, and the A-Number's format regex from
 * `applicantProfileShape`.
 */
export const aboutYouSectionSchema = profileFormSchema
	.pick({ givenName: true, familyName: true })
	.extend({ aNumber: applicantProfileShape.shape.aNumber })

/**
 * Full-form schema for the final `form.handleSubmit()`. Each section is typed as
 * plain strings (so the validator input matches the form values), refined to the
 * strict per-step rules. `replacementReason` stays lenient at the field level and
 * is required by `.superRefine` only for a replacement; the same refine rejects
 * the I-751 guardrail case so a conditional renewal can never produce an I-90.
 */
export const i90FullSchema = z
	.object({
		reasonForFiling: z
			.object({ reasonForFiling: z.string() })
			.refine((s) => reasonSectionSchema.safeParse(s).success, {
				message: 'Choose whether you’re renewing or replacing',
			}),
		residency: z
			.object({ residentType: z.string() })
			.refine((s) => residencySectionSchema.safeParse(s).success, {
				message: 'Choose your resident type',
			}),
		replacementReason: z.object({ replacementReason: z.string() }),
		aboutYou: z
			.object({ givenName: z.string(), familyName: z.string(), aNumber: z.string() })
			.refine((s) => aboutYouSectionSchema.safeParse(s).success, {
				message: 'Add your legal name and A-Number',
			}),
	})
	.superRefine((values, ctx) => {
		// A replacement requires its reason (the branch step is shown for it).
		if (
			values.reasonForFiling.reasonForFiling === 'replacement' &&
			!replacementReasonSectionSchema.safeParse(values.replacementReason).success
		) {
			ctx.addIssue({
				code: 'custom',
				message: 'Choose why you need a replacement',
				path: ['replacementReason'],
			})
		}
		// A conditional resident cannot RENEW via I-90 — they must file Form I-751.
		if (isI751Guardrail(values)) {
			ctx.addIssue({
				code: 'custom',
				message: 'A conditional (2-year) resident must file Form I-751, not Form I-90',
				path: ['residency'],
			})
		}
	})

/** Per-section default values — the keys are the `form.FormGroup name`s. */
export const i90FormOpts = formOptions({
	defaultValues: {
		reasonForFiling: { reasonForFiling: '' },
		residency: { residentType: '' },
		replacementReason: { replacementReason: '' },
		aboutYou: { givenName: '', familyName: '', aNumber: '' },
	},
})

export type I90Values = (typeof i90FormOpts)['defaultValues']

/** The persisted draft shape. Mirrors the wizard's sections. */
export type I90Draft = I90Values

/** The ordered ids of every wizard step (Review is the terminal summary). */
export const I90_STEP_IDS = [
	'reasonForFiling',
	'residency',
	'replacementReason',
	'i751Guardrail',
	'aboutYou',
	'review',
] as const

export type I90StepId = (typeof I90_STEP_IDS)[number]

/**
 * The I-751 guardrail: a conditional (2-year) resident who chose *renewal* cannot
 * file an I-90 — renewal of a conditional card means filing Form I-751 to remove
 * conditions. (A conditional resident CAN still I-90 to *replace* a lost/damaged
 * card, so the guardrail is scoped to renewal.)
 */
export function isI751Guardrail(values: I90Values): boolean {
	return (
		values.reasonForFiling.reasonForFiling === 'renewal' &&
		values.residency.residentType === CONDITIONAL_RESIDENT
	)
}

/**
 * The visible steps for the current answers — the single source of truth for the
 * branches. The replacement-reason step shows only for a replacement; the I-751
 * guardrail is a TERMINAL off-ramp (no About you / Review) when a conditional
 * resident chose renewal.
 */
export function getVisibleSteps(values: I90Values): I90StepId[] {
	if (isI751Guardrail(values)) {
		return ['reasonForFiling', 'residency', 'i751Guardrail']
	}
	const steps: I90StepId[] = ['reasonForFiling', 'residency']
	if (values.reasonForFiling.reasonForFiling === 'replacement') {
		steps.push('replacementReason')
	}
	steps.push('aboutYou', 'review')
	return steps
}

/** The next *visible* step after `current`, or `undefined` if `current` is last. */
export function nextVisibleStepId(values: I90Values, current: I90StepId): I90StepId | undefined {
	const visible = getVisibleSteps(values)
	const index = visible.indexOf(current)
	if (index !== -1) {
		return visible[index + 1]
	}
	// `current` is no longer visible (e.g. a branch step after the answers
	// changed) — advance to the first visible step after its canonical position.
	const canonicalIndex = I90_STEP_IDS.indexOf(current)
	return visible.find((id) => I90_STEP_IDS.indexOf(id) > canonicalIndex)
}

/** Whether USCIS charges a filing fee for these answers (informational; ADR-0006). */
export function hasUscisFilingFee(values: I90Values): boolean {
	if (values.reasonForFiling.reasonForFiling === 'replacement') {
		return !FEE_EXEMPT_REPLACEMENT_REASONS.has(values.replacementReason.replacementReason)
	}
	return true
}

/** The fields prefilled from the self applicant's saved profile (autofill). */
type ProfilePrefill =
	| { givenName?: string; familyName?: string; aNumber?: string }
	| null
	| undefined

/** Merge a saved draft section over its prefilled section, ignoring empty draft fields. */
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
 * (name + A-Number autofill), then let any previously saved draft win — merged
 * per section so a partial or empty-defaulted draft never drops a prefilled field.
 */
export function buildI90InitialValues(
	savedDraft: Partial<I90Values> | null | undefined,
	profile: ProfilePrefill,
): I90Values {
	const base = i90FormOpts.defaultValues
	const prefilled: I90Values = {
		...base,
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
		residency: mergeSection(prefilled.residency, savedDraft.residency),
		replacementReason: mergeSection(prefilled.replacementReason, savedDraft.replacementReason),
		aboutYou: mergeSection(prefilled.aboutYou, savedDraft.aboutYou),
	}
}

/** Map the per-section answers to the draft persisted to Convex (identity). */
export function toI90Draft(values: I90Values): I90Draft {
	return values
}

/** Human label for a stored option value (e.g. for the Review summary). */
export function optionLabel(options: readonly Option[], value: string): string {
	return options.find((option) => option.value === value)?.label ?? value
}
