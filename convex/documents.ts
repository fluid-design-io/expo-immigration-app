import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { documentTypeValidator } from './lib/validators'
import { loadOwnedApplicant, requireOwnedApplicant } from './model/applicants'

/** Add a document to an applicant's vault. Each add is a new version of its type. */
export const addDocument = mutation({
	args: {
		applicantId: v.id('applicants'),
		type: documentTypeValidator,
		expiryDate: v.optional(v.string()),
		storageId: v.optional(v.id('_storage')),
	},
	handler: async (ctx, args) => {
		const { ownerId } = await requireOwnedApplicant(ctx, args.applicantId)

		// Read-then-increment is safe under Convex's serializable OCC: this query
		// reads the by_applicantId_and_type index range, so a concurrent insert
		// into that same range conflicts and retries the loser, which re-reads the
		// new latest version. Versions therefore stay unique per (applicant, type).
		const latest = await ctx.db
			.query('documents')
			.withIndex('by_applicantId_and_type', (q) =>
				q.eq('applicantId', args.applicantId).eq('type', args.type),
			)
			.order('desc')
			.first()

		return await ctx.db.insert('documents', {
			applicantId: args.applicantId,
			ownerId,
			type: args.type,
			version: (latest?.version ?? 0) + 1,
			expiryDate: args.expiryDate,
			storageId: args.storageId,
		})
	},
})

/** List every document in an applicant's vault, if the caller owns the applicant. */
export const listDocuments = query({
	args: { applicantId: v.id('applicants') },
	handler: async (ctx, args) => {
		const applicant = await loadOwnedApplicant(ctx, args.applicantId)
		if (applicant === null) {
			return []
		}
		return await ctx.db
			.query('documents')
			.withIndex('by_applicantId', (q) => q.eq('applicantId', args.applicantId))
			.take(100)
	},
})

/**
 * The current (latest-version) document of a given type for an applicant — what
 * the vault and reminders treat as live. Returns null if the caller does not own
 * the applicant or there is no such document.
 */
export const getCurrentDocument = query({
	args: { applicantId: v.id('applicants'), type: documentTypeValidator },
	handler: async (ctx, args) => {
		const applicant = await loadOwnedApplicant(ctx, args.applicantId)
		if (applicant === null) {
			return null
		}
		return await ctx.db
			.query('documents')
			.withIndex('by_applicantId_and_type', (q) =>
				q.eq('applicantId', args.applicantId).eq('type', args.type),
			)
			.order('desc')
			.first()
	},
})
