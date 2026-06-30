/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import {
	aboutYouSectionSchema,
	eligibilitySectionSchema,
	getVisibleSteps,
	i765FormOpts,
	i765FullSchema,
	nextVisibleStepId,
	stemDetailsSectionSchema,
	type I765Values,
} from '../src/components/filing/i765/i765.wizard-form'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

/** A complete set of answers, overridable per test. */
function values(overrides: Partial<I765Values> = {}): I765Values {
	return { ...i765FormOpts.defaultValues, ...overrides }
}

test('saveDraft then getDraft round-trips the I-765 draft for the owner', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const draft = values({ eligibility: { eligibilityCategory: 'c08' } })
	await asAccount.mutation(api.filings.saveDraft, { formType: 'i765', draft })

	const saved = await asAccount.query(api.filings.getDraft, { formType: 'i765' })
	expect(saved).toMatchObject({ formType: 'i765', ownerId: expect.any(String) })
	expect(saved?.draft).toMatchObject({ eligibility: { eligibilityCategory: 'c08' } })
	expect(typeof saved?.updatedAt).toBe('number')
})

test('saveDraft upserts a single i765 draft per owner', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	await asAccount.mutation(api.filings.saveDraft, {
		formType: 'i765',
		draft: values({ reasonForFiling: { reasonForFiling: 'initial' } }),
	})
	await asAccount.mutation(api.filings.saveDraft, {
		formType: 'i765',
		draft: values({ reasonForFiling: { reasonForFiling: 'renewal' } }),
	})

	// Still exactly one filing, and the latest answers win.
	const filings = await asAccount.query(api.filings.listFilings, {})
	expect(filings).toHaveLength(1)
	const saved = await asAccount.query(api.filings.getDraft, { formType: 'i765' })
	expect(saved?.draft).toMatchObject({ reasonForFiling: { reasonForFiling: 'renewal' } })
})

test('getDraft is owner-scoped — account B cannot read account A’s draft', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })

	await accountA.mutation(api.filings.saveDraft, {
		formType: 'i765',
		draft: values({ aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' } }),
	})

	// B sees neither A's draft by form type nor in their own list.
	expect(await accountB.query(api.filings.getDraft, { formType: 'i765' })).toBeNull()
	expect(await accountB.query(api.filings.listFilings, {})).toEqual([])
})

test('saveDraft rejects an unauthenticated caller', async () => {
	const t = convexTest(schema, modules)

	await expect(
		t.mutation(api.filings.saveDraft, { formType: 'i765', draft: values() }),
	).rejects.toThrow('Not authenticated')
})

test('unauthenticated reads return null/empty instead of throwing', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	await account.mutation(api.filings.saveDraft, { formType: 'i765', draft: values() })

	expect(await t.query(api.filings.getDraft, { formType: 'i765' })).toBeNull()
	expect(await t.query(api.filings.listFilings, {})).toEqual([])
})

// --- Wizard branching + per-step validation (pure unit tests) ---

test('getVisibleSteps skips the STEM step unless the category is (c)(3)(C)', () => {
	const nonStem = getVisibleSteps(values({ eligibility: { eligibilityCategory: 'c08' } }))
	expect(nonStem).not.toContain('stemDetails')
	expect(nonStem).toEqual(['reasonForFiling', 'eligibility', 'aboutYou', 'review'])

	const stem = getVisibleSteps(values({ eligibility: { eligibilityCategory: 'c3c' } }))
	expect(stem).toContain('stemDetails')
	expect(stem).toEqual(['reasonForFiling', 'eligibility', 'stemDetails', 'aboutYou', 'review'])
})

test('per-step schemas accept valid sections and reject invalid ones', () => {
	// Eligibility: an empty default fails, a known category passes.
	expect(eligibilitySectionSchema.safeParse({ eligibilityCategory: '' }).success).toBe(false)
	expect(eligibilitySectionSchema.safeParse({ eligibilityCategory: 'c3c' }).success).toBe(true)

	// STEM branch: SEVIS ID must be `N` + 10 digits.
	expect(
		stemDetailsSectionSchema.safeParse({ degreeLevel: 'masters', sevisNumber: '12345' }).success,
	).toBe(false)
	expect(
		stemDetailsSectionSchema.safeParse({ degreeLevel: 'masters', sevisNumber: 'N0012345678' })
			.success,
	).toBe(true)

	// About you: name required + A-Number format from the shared profile shape.
	expect(
		aboutYouSectionSchema.safeParse({ givenName: '', familyName: 'Gomez', aNumber: 'A012345678' })
			.success,
	).toBe(false)
	expect(
		aboutYouSectionSchema.safeParse({
			givenName: 'Maria',
			familyName: 'Gomez',
			aNumber: 'A012345678',
		}).success,
	).toBe(true)
})

test('i765FullSchema requires STEM details only for the STEM OPT category', () => {
	const valid = values({
		reasonForFiling: { reasonForFiling: 'renewal' },
		eligibility: { eligibilityCategory: 'c3c' },
		stemDetails: { degreeLevel: 'masters', sevisNumber: 'N0012345678' },
		aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
	})

	// (c)(3)(C) with valid STEM details passes the final submit schema...
	expect(i765FullSchema.safeParse(valid).success).toBe(true)
	// ...but reaching Review for (c)(3)(C) with empty STEM details must fail
	// (the gap BugBot flagged: direct/stack nav past the hidden-when-skipped step).
	expect(
		i765FullSchema.safeParse({ ...valid, stemDetails: { degreeLevel: '', sevisNumber: '' } })
			.success,
	).toBe(false)
	// A non-STEM category never requires STEM details — the step is skipped.
	expect(
		i765FullSchema.safeParse({
			...valid,
			eligibility: { eligibilityCategory: 'c08' },
			stemDetails: { degreeLevel: '', sevisNumber: '' },
		}).success,
	).toBe(true)
})

test('nextVisibleStepId advances past a now-hidden current step (no Continue no-op)', () => {
	// On the STEM step after the category changed away from (c)(3)(C), STEM is no
	// longer visible — the next step is the one after STEM's position: aboutYou.
	expect(
		nextVisibleStepId(values({ eligibility: { eligibilityCategory: 'c08' } }), 'stemDetails'),
	).toBe('aboutYou')
})
