/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function makeApplicant(account: ReturnType<ReturnType<typeof convexTest>['withIdentity']>) {
	return await account.mutation(api.applicants.createApplicant, {
		displayName: 'Maria Gomez',
		relationship: 'self',
	})
}

test('a document’s metadata is saved and listed for its applicant', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	const applicantId = await makeApplicant(account)

	await account.mutation(api.documents.addDocument, {
		applicantId,
		type: 'ead',
		expiryDate: '2026-09-30',
	})

	const docs = await account.query(api.documents.listDocuments, { applicantId })
	expect(docs).toHaveLength(1)
	expect(docs[0]).toMatchObject({ type: 'ead', expiryDate: '2026-09-30', version: 1 })
})

test('adding a newer document of the same type supersedes the prior as current', async () => {
	const t = convexTest(schema, modules)
	const account = t.withIdentity({ subject: 'account-a' })
	const applicantId = await makeApplicant(account)

	await account.mutation(api.documents.addDocument, {
		applicantId,
		type: 'ead',
		expiryDate: '2024-09-30',
	})
	await account.mutation(api.documents.addDocument, {
		applicantId,
		type: 'ead',
		expiryDate: '2026-09-30',
	})

	// The latest upload is the current EAD...
	const current = await account.query(api.documents.getCurrentDocument, {
		applicantId,
		type: 'ead',
	})
	expect(current).toMatchObject({ version: 2, expiryDate: '2026-09-30' })

	// ...but both versions are retained in the vault.
	const docs = await account.query(api.documents.listDocuments, { applicantId })
	expect(docs).toHaveLength(2)
})

test('listDocuments and addDocument are scoped to the applicant’s owner', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })
	const applicantId = await makeApplicant(accountA)
	await accountA.mutation(api.documents.addDocument, { applicantId, type: 'passport' })

	// B cannot list A's applicant's documents...
	expect(await accountB.query(api.documents.listDocuments, { applicantId })).toEqual([])
	// ...nor add documents to A's applicant.
	await expect(
		accountB.mutation(api.documents.addDocument, { applicantId, type: 'passport' }),
	).rejects.toThrow('Applicant not found')
})

test('getCurrentDocument hides other accounts’ documents and returns null for unseen types', async () => {
	const t = convexTest(schema, modules)
	const accountA = t.withIdentity({ subject: 'account-a' })
	const accountB = t.withIdentity({ subject: 'account-b' })
	const applicantId = await makeApplicant(accountA)
	await accountA.mutation(api.documents.addDocument, {
		applicantId,
		type: 'ead',
		expiryDate: '2026-09-30',
	})

	// B cannot read A's current EAD (no leak through getCurrentDocument)...
	expect(
		await accountB.query(api.documents.getCurrentDocument, { applicantId, type: 'ead' }),
	).toBeNull()
	// ...and a type the owner never added returns null rather than an unrelated doc.
	expect(
		await accountA.query(api.documents.getCurrentDocument, { applicantId, type: 'passport' }),
	).toBeNull()
})
