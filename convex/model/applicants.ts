import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getOwnerId, requireOwnerId } from '../lib/auth'

/**
 * Load an applicant only if the current caller owns it. Returns `null` for an
 * unauthenticated caller, a missing applicant, or one owned by someone else —
 * the read-path behaviour (callers translate `null` into null/empty results
 * without leaking the applicant's existence).
 */
export async function loadOwnedApplicant(
	ctx: QueryCtx | MutationCtx,
	applicantId: Id<'applicants'>,
): Promise<Doc<'applicants'> | null> {
	const ownerId = await getOwnerId(ctx)
	if (ownerId === null) {
		return null
	}
	const applicant = await ctx.db.get(applicantId)
	if (applicant === null || applicant.ownerId !== ownerId) {
		return null
	}
	return applicant
}

/**
 * Like {@link loadOwnedApplicant} but for write paths: throws when the caller is
 * unauthenticated or does not own the applicant, and returns the owner id
 * alongside the applicant so callers can scope newly created child records.
 */
export async function requireOwnedApplicant(
	ctx: MutationCtx,
	applicantId: Id<'applicants'>,
): Promise<{ ownerId: string; applicant: Doc<'applicants'> }> {
	const ownerId = await requireOwnerId(ctx)
	const applicant = await ctx.db.get(applicantId)
	if (applicant === null || applicant.ownerId !== ownerId) {
		throw new Error('Applicant not found')
	}
	return { ownerId, applicant }
}
