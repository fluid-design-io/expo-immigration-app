/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('an authenticated account holder can create an applicant and read it back', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const applicantId = await asAccount.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	const applicant = await asAccount.query(api.applicants.getApplicant, { applicantId })

	expect(applicant).toMatchObject({ displayName: 'Maria Gomez', relationship: 'self' })
})

test('createApplicant rejects an unauthenticated caller', async () => {
	const t = convexTest(schema, modules)

	await expect(
		t.mutation(api.applicants.createApplicant, {
			displayName: 'No Account',
			relationship: 'self',
		}),
	).rejects.toThrow('Not authenticated')
})

test('an account holder cannot read another account’s applicant', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })

	const applicantId = await accountA.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	// B cannot read A's applicant by id, and does not see it in their own list.
	expect(await accountB.query(api.applicants.getApplicant, { applicantId })).toBeNull()
	expect(await accountB.query(api.applicants.listApplicants, {})).toEqual([])
})

test('profile fields persist and round-trip through getApplicant', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	const applicantId = await account.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	await account.mutation(api.applicants.updateApplicantProfile, {
		applicantId,
		profile: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
	})

	const applicant = await account.query(api.applicants.getApplicant, { applicantId })
	expect(applicant?.profile).toMatchObject({
		givenName: 'Maria',
		familyName: 'Gomez',
		aNumber: 'A012345678',
	})
})

test('updateApplicantProfile rejects a non-owner', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })
	const applicantId = await accountA.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	await expect(
		accountB.mutation(api.applicants.updateApplicantProfile, {
			applicantId,
			profile: { givenName: 'Mallory' },
		}),
	).rejects.toThrow('Applicant not found')
})

test('unauthenticated reads return empty results instead of throwing', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	const applicantId = await account.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	// The read-path degrades gracefully for an unauthenticated caller.
	expect(await t.query(api.applicants.getApplicant, { applicantId })).toBeNull()
	expect(await t.query(api.applicants.listApplicants, {})).toEqual([])
})
