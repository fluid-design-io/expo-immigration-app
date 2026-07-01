/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import {
	buildI90InitialValues,
	getVisibleSteps,
	hasUscisFilingFee,
	i90FormOpts,
	i90FullSchema,
	isI751Guardrail,
	nextVisibleStepId,
	type I90Values,
} from '../src/components/filing/i90/i90.wizard-form'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

/** A set of I-90 answers, overridable per test. */
function values(overrides: Partial<I90Values> = {}): I90Values {
	return { ...i90FormOpts.defaultValues, ...overrides }
}

// --- Wizard branching + the I-751 guardrail (pure unit tests) ---

test('renewal vs replacement changes the downstream steps shown', () => {
	const renewal = getVisibleSteps(
		values({
			reasonForFiling: { reasonForFiling: 'renewal' },
			residency: { residentType: 'tenYear' },
		}),
	)
	// A 10-year renewal skips the replacement-reason step.
	expect(renewal).not.toContain('replacementReason')
	expect(renewal).toEqual(['reasonForFiling', 'residency', 'aboutYou', 'review'])

	const replacement = getVisibleSteps(
		values({
			reasonForFiling: { reasonForFiling: 'replacement' },
			residency: { residentType: 'tenYear' },
		}),
	)
	// A replacement reveals the replacement-reason step.
	expect(replacement).toContain('replacementReason')
	expect(replacement).toEqual([
		'reasonForFiling',
		'residency',
		'replacementReason',
		'aboutYou',
		'review',
	])
})

test('a conditional resident renewing hits the I-751 guardrail (terminal, no Review)', () => {
	const conditionalRenewal = values({
		reasonForFiling: { reasonForFiling: 'renewal' },
		residency: { residentType: 'conditional' },
	})
	expect(isI751Guardrail(conditionalRenewal)).toBe(true)

	// The flow ends at the I-751 off-ramp — no About you / Review, so no I-90.
	const steps = getVisibleSteps(conditionalRenewal)
	expect(steps).toEqual(['reasonForFiling', 'residency', 'i751Guardrail'])
	expect(steps).not.toContain('review')

	// A conditional resident REPLACING a card is allowed (guardrail scoped to renewal).
	const conditionalReplacement = values({
		reasonForFiling: { reasonForFiling: 'replacement' },
		residency: { residentType: 'conditional' },
	})
	expect(isI751Guardrail(conditionalReplacement)).toBe(false)
	expect(getVisibleSteps(conditionalReplacement)).toContain('review')
})

test('a stale step under the guardrail routes to the I-751 off-ramp (no trap)', () => {
	const guardrail = values({
		reasonForFiling: { reasonForFiling: 'renewal' },
		residency: { residentType: 'conditional' },
	})
	// About you sits canonically AFTER the guardrail step, so a plain "next after
	// my position" search finds nothing — Continue must still route to the
	// terminal off-ramp rather than no-op.
	expect(nextVisibleStepId(guardrail, 'aboutYou')).toBe('i751Guardrail')
	// The replacement step (canonically before the guardrail) also routes there.
	expect(nextVisibleStepId(guardrail, 'replacementReason')).toBe('i751Guardrail')
})

test('i90FullSchema requires a replacement reason and rejects the I-751 guardrail', () => {
	const base = values({
		residency: { residentType: 'tenYear' },
		aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
	})

	// A 10-year renewal with a name is complete.
	expect(
		i90FullSchema.safeParse({ ...base, reasonForFiling: { reasonForFiling: 'renewal' } }).success,
	).toBe(true)

	// A replacement with no reason fails...
	expect(
		i90FullSchema.safeParse({ ...base, reasonForFiling: { reasonForFiling: 'replacement' } })
			.success,
	).toBe(false)
	// ...but passes once a reason is chosen.
	expect(
		i90FullSchema.safeParse({
			...base,
			reasonForFiling: { reasonForFiling: 'replacement' },
			replacementReason: { replacementReason: 'lost' },
		}).success,
	).toBe(true)

	// A conditional renewal (the guardrail) can never satisfy the submit schema.
	expect(
		i90FullSchema.safeParse({
			...base,
			reasonForFiling: { reasonForFiling: 'renewal' },
			residency: { residentType: 'conditional' },
		}).success,
	).toBe(false)
})

test('hasUscisFilingFee is waived only for never-received and USCIS-error replacements', () => {
	const replace = (replacementReason: string) =>
		hasUscisFilingFee(
			values({
				reasonForFiling: { reasonForFiling: 'replacement' },
				replacementReason: { replacementReason },
			}),
		)
	expect(replace('neverReceived')).toBe(false)
	expect(replace('uscisError')).toBe(false)
	expect(replace('lost')).toBe(true)
	// A renewal always carries a fee.
	expect(hasUscisFilingFee(values({ reasonForFiling: { reasonForFiling: 'renewal' } }))).toBe(true)
})

test('buildI90InitialValues keeps profile prefills when a draft holds empty defaults', () => {
	const profile = { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' }
	const restored = buildI90InitialValues(i90FormOpts.defaultValues, profile)
	expect(restored.aboutYou.givenName).toBe('Maria')
	expect(restored.aboutYou.aNumber).toBe('A012345678')
})

// --- Draft persistence for the I-90 form type (round-trip) ---

test('saveDraft/getDraft round-trips an I-90 draft, owner-scoped', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const draft = values({ reasonForFiling: { reasonForFiling: 'replacement' } })
	await asAccount.mutation(api.filings.saveDraft, { formType: 'i90', draft })

	const saved = await asAccount.query(api.filings.getDraft, { formType: 'i90' })
	expect(saved?.draft).toMatchObject({ reasonForFiling: { reasonForFiling: 'replacement' } })

	// The I-90 draft is separate from any I-765 draft.
	expect(await asAccount.query(api.filings.getDraft, { formType: 'i765' })).toBeNull()
})
