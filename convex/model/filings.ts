import { type Infer, v } from 'convex/values'
import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * The USCIS forms that have an Interview wizard: the I-765 (EAD renewal) tracer
 * (ADR-0003) and the I-90 (green-card renewal/replacement, issue #11). A
 * `v.union` of literals keeps every `filings` query owner-scoped by `formType`
 * without touching the index shape.
 */
export const filingFormTypeValidator = v.union(v.literal('i765'), v.literal('i90'))

/** The TS type for a filing's form type (`'i765' | 'i90'`). */
export type FilingFormType = Infer<typeof filingFormTypeValidator>

/**
 * Load the caller's single draft for a given form type, or `null` when none
 * exists. The owner id is passed in (already derived server-side via the auth
 * helper) so this stays a pure model helper. Relies on the `saveDraft` upsert
 * keeping at most one draft per (owner, formType), so `.unique()` never throws.
 */
export async function loadOwnedFiling(
	ctx: QueryCtx | MutationCtx,
	ownerId: string,
	formType: FilingFormType,
): Promise<Doc<'filings'> | null> {
	return await ctx.db
		.query('filings')
		.withIndex('by_ownerId_and_formType', (q) =>
			q.eq('ownerId', ownerId).eq('formType', formType),
		)
		.unique()
}
