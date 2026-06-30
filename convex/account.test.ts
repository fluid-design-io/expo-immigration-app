/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

// migrateAnonymousOwner derives ownerIds as `${CONVEX_SITE_URL}|${userId}` (the
// JWT issuer + Better Auth user id, mirroring Convex's tokenIdentifier). Set the
// issuer so the derivation is deterministic in the test.
const ISSUER = 'https://test.convex.site'

test('migrateAnonymousOwner re-owns applicants and their documents onto the new account', async () => {
	process.env.CONVEX_SITE_URL = ISSUER
	const t = convexTest(schema, modules)

	const anonOwner = `${ISSUER}|anon-user-1`
	const credOwner = `${ISSUER}|cred-user-2`

	// Data created under the anonymous identity.
	const { applicantId, documentId } = await t.run(async (ctx) => {
		const applicantId = await ctx.db.insert('applicants', {
			ownerId: anonOwner,
			displayName: 'Maria Gomez',
			relationship: 'self',
		})
		const documentId = await ctx.db.insert('documents', {
			applicantId,
			ownerId: anonOwner,
			type: 'passport',
			version: 1,
		})
		return { applicantId, documentId }
	})

	const result = await t.mutation(internal.account.migrateAnonymousOwner, {
		anonymousUserId: 'anon-user-1',
		newUserId: 'cred-user-2',
	})
	expect(result).toEqual({ applicants: 1, documents: 1 })

	// Both the applicant and its document are now owned by the credentialed account.
	await t.run(async (ctx) => {
		expect((await ctx.db.get(applicantId))?.ownerId).toBe(credOwner)
		expect((await ctx.db.get(documentId))?.ownerId).toBe(credOwner)
	})
})

test('migrateAnonymousOwner leaves another account’s data untouched', async () => {
	process.env.CONVEX_SITE_URL = ISSUER
	const t = convexTest(schema, modules)

	const otherOwner = `${ISSUER}|someone-else`
	const otherApplicantId = await t.run((ctx) =>
		ctx.db.insert('applicants', {
			ownerId: otherOwner,
			displayName: 'Someone Else',
			relationship: 'self',
		}),
	)

	const result = await t.mutation(internal.account.migrateAnonymousOwner, {
		anonymousUserId: 'anon-user-1',
		newUserId: 'cred-user-2',
	})
	expect(result).toEqual({ applicants: 0, documents: 0 })

	await t.run(async (ctx) => {
		expect((await ctx.db.get(otherApplicantId))?.ownerId).toBe(otherOwner)
	})
})
