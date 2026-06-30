import { v } from 'convex/values'
import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * The USCIS forms that have an Interview wizard. v1 ships only the I-765 (EAD
 * renewal) tracer (ADR-0003); this is a `v.union` of literals so adding I-90
 * later is a one-line change that keeps every `filings` query owner-scoped by
 * `formType` without touching the index shape.
 */
export const filingFormTypeValidator = v.literal('i765')

/** The TS type for a filing's form type (e.g. `'i765'`). */
export type FilingFormType = (typeof filingFormTypeValidator)['value']

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
