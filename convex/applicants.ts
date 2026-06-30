import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getOwnerId, requireOwnerId } from './lib/auth'
import { applicantProfileValidator, relationshipValidator } from './lib/validators'
import { loadOwnedApplicant, requireOwnedApplicant } from './model/applicants'

/** Create an applicant owned by the current account holder. */
export const createApplicant = mutation({
	args: {
		displayName: v.string(),
		relationship: relationshipValidator,
	},
	handler: async (ctx, args) => {
		const ownerId = await requireOwnerId(ctx)
		return await ctx.db.insert('applicants', {
			ownerId,
			displayName: args.displayName,
			relationship: args.relationship,
		})
	},
})

/** Read a single applicant, but only if it belongs to the current account holder. */
export const getApplicant = query({
	args: { applicantId: v.id('applicants') },
	handler: async (ctx, args) => {
		return await loadOwnedApplicant(ctx, args.applicantId)
	},
})

/** List the current account holder's applicants (empty for an unauthenticated caller). */
export const listApplicants = query({
	args: {},
	handler: async (ctx) => {
		// Mirror the read-path of getApplicant/listDocuments: return empty rather
		// than throw when unauthenticated, so the UI can render before auth resolves.
		const ownerId = await getOwnerId(ctx)
		if (ownerId === null) {
			return []
		}
		return await ctx.db
			.query('applicants')
			.withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
			.take(50)
	},
})

/**
 * Merge profile fields into an applicant the caller owns. Fields are shallow-
 * merged so partial updates (one screen at a time during onboarding) don't
 * clobber previously saved fields.
 */
export const updateApplicantProfile = mutation({
	args: {
		applicantId: v.id('applicants'),
		profile: applicantProfileValidator,
	},
	handler: async (ctx, args) => {
		const { applicant } = await requireOwnedApplicant(ctx, args.applicantId)
		await ctx.db.patch(args.applicantId, {
			profile: { ...(applicant.profile ?? {}), ...args.profile },
		})
		return null
	},
})
