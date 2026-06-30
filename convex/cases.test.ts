/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('an authenticated account holder can create a case and read it back', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const caseId = await asAccount.mutation(api.cases.createCase, {
		receiptNumber: 'IOE1234567890',
	})

	const theCase = await asAccount.query(api.cases.getCase, { caseId })
	expect(theCase).toMatchObject({
		receiptNumber: 'IOE1234567890',
		currentStatus: 'Case Received',
	})
	// History is seeded with the initial status.
	expect(theCase?.history).toHaveLength(1)
	expect(theCase?.history[0]).toMatchObject({ status: 'Case Received' })
})

test('createCase normalises the receipt number to uppercase', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const caseId = await asAccount.mutation(api.cases.createCase, {
		receiptNumber: '  ioe1234567890  ',
		initialStatus: 'Biometrics',
	})

	const theCase = await asAccount.query(api.cases.getCase, { caseId })
	expect(theCase?.receiptNumber).toBe('IOE1234567890')
	expect(theCase?.currentStatus).toBe('Biometrics')
})

test('createCase rejects an invalid receipt number', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	await expect(
		asAccount.mutation(api.cases.createCase, { receiptNumber: 'IOE123' }),
	).rejects.toThrow(/Receipt Number/)
	// Wrong shape: digits where letters belong.
	await expect(
		asAccount.mutation(api.cases.createCase, { receiptNumber: '1231234567890' }),
	).rejects.toThrow(/Receipt Number/)
})

test('createCase rejects an unauthenticated caller', async () => {
	const t = convexTest(schema, modules)

	await expect(
		t.mutation(api.cases.createCase, { receiptNumber: 'IOE1234567890' }),
	).rejects.toThrow('Not authenticated')
})

test('updateCaseStatus appends to history and sets the current status', async () => {
	const t = convexTest(schema, modules)
	const asAccount = t.withIdentity({ subject: 'account-a' })

	const caseId = await asAccount.mutation(api.cases.createCase, {
		receiptNumber: 'IOE1234567890',
		date: '2026-01-01',
	})

	await asAccount.mutation(api.cases.updateCaseStatus, {
		caseId,
		status: 'Biometrics',
		date: '2026-02-01',
	})
	await asAccount.mutation(api.cases.updateCaseStatus, {
		caseId,
		status: 'Approved',
		date: '2026-03-01',
	})

	const theCase = await asAccount.query(api.cases.getCase, { caseId })
	expect(theCase?.currentStatus).toBe('Approved')
	expect(theCase?.history).toEqual([
		{ status: 'Case Received', date: '2026-01-01' },
		{ status: 'Biometrics', date: '2026-02-01' },
		{ status: 'Approved', date: '2026-03-01' },
	])
})

test('an account holder cannot read or update another account’s case', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })

	const caseId = await accountA.mutation(api.cases.createCase, {
		receiptNumber: 'IOE1234567890',
	})

	// B cannot read A's case by id, and does not see it in their own list.
	expect(await accountB.query(api.cases.getCase, { caseId })).toBeNull()
	expect(await accountB.query(api.cases.listCases, {})).toEqual([])
	await expect(
		accountB.mutation(api.cases.updateCaseStatus, { caseId, status: 'Approved' }),
	).rejects.toThrow('Case not found')
})

test('createCase rejects linking an applicant the caller does not own', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })

	const applicantId = await accountA.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})

	await expect(
		accountB.mutation(api.cases.createCase, {
			receiptNumber: 'IOE1234567890',
			applicantId,
		}),
	).rejects.toThrow('Applicant not found')
})

test('unauthenticated reads return empty/null instead of throwing', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	const caseId = await account.mutation(api.cases.createCase, {
		receiptNumber: 'IOE1234567890',
	})

	expect(await t.query(api.cases.getCase, { caseId })).toBeNull()
	expect(await t.query(api.cases.listCases, {})).toEqual([])
})
