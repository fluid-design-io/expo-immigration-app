import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

/**
 * Re-own everything created under an anonymous identity onto the upgraded
 * (credentialed) identity. Invoked from `onLinkAccount` in convex/auth.ts after
 * Better Auth's anonymous plugin links an anonymous user to permanent
 * credentials (ADR-0009).
 *
 * WHY THIS IS NEEDED (research finding): on this `@convex-dev/better-auth`
 * version the anonymous plugin does NOT keep the same identity across the
 * upgrade. Its post-link hook creates a BRAND-NEW user row for the credentialed
 * account and then DELETES the anonymous user (see the `after` hook in
 * `node_modules/better-auth/dist/plugins/anonymous/index.mjs`, where
 * `isSameUser` is false because a new user was created, so the anonymous user
 * and its sessions are removed). The Convex identity `tokenIdentifier` is
 * `${issuer}|${subject}` where `subject` is the Better Auth user id and
 * `issuer` is `CONVEX_SITE_URL` (the convex plugin signs the JWT with
 * `sub = session.user.id`). Because the user id changes, the derived `ownerId`
 * (see convex/lib/auth.ts) CHANGES too — so without this migration the
 * anonymous user's `applicants`/`documents` would be orphaned under the old
 * ownerId.
 *
 * The user ids are reconstructed into ownerIds here using the same
 * `${issuer}|${userId}` shape Convex uses for `tokenIdentifier`, keyed off the
 * deployment's `CONVEX_SITE_URL`.
 *
 * Bounds: a single anonymous onboarding only ever accrues a handful of
 * applicants/documents, so the batched reads below comfortably fit one
 * mutation transaction.
 */
export const migrateAnonymousOwner = internalMutation({
	args: {
		anonymousUserId: v.string(),
		newUserId: v.string(),
	},
	returns: v.object({ applicants: v.number(), documents: v.number() }),
	handler: async (ctx, args) => {
		// The convex/ tsconfig ships no Node typings; read env through globalThis
		// to stay typed (mirrors convex/auth.ts). `CONVEX_SITE_URL` is a Convex
		// system env var available at runtime and is exactly the JWT issuer.
		const env =
			(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
		const issuer = env.CONVEX_SITE_URL
		if (!issuer) {
			throw new Error(
				'CONVEX_SITE_URL is not set; cannot derive ownerId for the anonymous → credentialed migration',
			)
		}

		const fromOwnerId = `${issuer}|${args.anonymousUserId}`
		const toOwnerId = `${issuer}|${args.newUserId}`
		if (fromOwnerId === toOwnerId) {
			return { applicants: 0, documents: 0 }
		}

		let applicants = 0
		let documents = 0

		const ownedApplicants = await ctx.db
			.query('applicants')
			.withIndex('by_ownerId', (q) => q.eq('ownerId', fromOwnerId))
			.take(200)

		for (const applicant of ownedApplicants) {
			await ctx.db.patch(applicant._id, { ownerId: toOwnerId })
			applicants += 1

			// `documents.ownerId` is denormalised from its applicant; re-own each of
			// the applicant's documents via the existing by_applicantId index (there
			// is no by_ownerId index on `documents`).
			const applicantDocuments = await ctx.db
				.query('documents')
				.withIndex('by_applicantId', (q) => q.eq('applicantId', applicant._id))
				.take(500)
			for (const document of applicantDocuments) {
				await ctx.db.patch(document._id, { ownerId: toOwnerId })
				documents += 1
			}
		}

		return { applicants, documents }
	},
})
