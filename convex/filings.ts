import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getOwnerId, requireOwnerId } from './lib/auth'
import { filingFormTypeValidator, loadOwnedFiling } from './model/filings'

/**
 * Save (upsert) the current account holder's draft for a form's Interview
 * wizard (ADR-0013). There is at most one draft per (owner, formType), so an
 * existing draft is patched in place and a first save inserts it. `draft` is the
 * wizard's opaque per-section answers (issue #8 tracer). Returns the filing id.
 */
export const saveDraft = mutation({
	args: {
		formType: filingFormTypeValidator,
		draft: v.any(),
	},
	handler: async (ctx, args) => {
		const ownerId = await requireOwnerId(ctx)
		// Read-then-upsert is safe under Convex's serializable OCC (every mutation is
		// a transaction): loadOwnedFiling reads the by_ownerId_and_formType index
		// range, so a concurrent first-save inserting into that same range conflicts
		// and retries the loser, which then re-reads the now-existing draft and
		// patches it. At most one draft per (owner, formType) survives, so the
		// `.unique()` in loadOwnedFiling never sees a duplicate. (Same guarantee
		// documents.addDocument relies on for per-(applicant, type) versions.)
		const existing = await loadOwnedFiling(ctx, ownerId, args.formType)
		const updatedAt = Date.now()

		if (existing !== null) {
			await ctx.db.patch(existing._id, { draft: args.draft, updatedAt })
			return existing._id
		}

		return await ctx.db.insert('filings', {
			ownerId,
			formType: args.formType,
			draft: args.draft,
			updatedAt,
		})
	},
})

/**
 * Read the current account holder's draft for a form type, or `null` when none
 * exists. Mirrors the read-path of getApplicant/getCase: returns `null` rather
 * than throwing when unauthenticated, so the wizard can restore before auth
 * resolves.
 */
export const getDraft = query({
	args: { formType: filingFormTypeValidator },
	handler: async (ctx, args) => {
		const ownerId = await getOwnerId(ctx)
		if (ownerId === null) {
			return null
		}
		return await loadOwnedFiling(ctx, ownerId, args.formType)
	},
})

/** List the current account holder's filings (empty for an unauthenticated caller). */
export const listFilings = query({
	args: {},
	handler: async (ctx) => {
		const ownerId = await getOwnerId(ctx)
		if (ownerId === null) {
			return []
		}
		return await ctx.db
			.query('filings')
			.withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
			.take(50)
	},
})
