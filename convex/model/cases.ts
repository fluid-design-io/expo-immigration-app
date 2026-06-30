import { type Infer, v } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getOwnerId, requireOwnerId } from '../lib/auth'

/**
 * The canonical USCIS case-status stages, in processing order (CONTEXT.md
 * "Case Status", ADR-0008). Order is meaningful: a case advances through these
 * stages over time and each step is appended to its history timeline. This is
 * the source of truth for the stored status union below; the RN bundle keeps a
 * parallel pure list in `src/components/cases/cases.schema.ts` for ordering.
 */
export const CASE_STATUSES = [
	'Case Received',
	'Biometrics',
	'Request for Evidence',
	'Approved',
	'Card Is Being Produced',
	'Card Was Mailed',
	'Card Was Delivered',
] as const

export type CaseStatus = (typeof CASE_STATUSES)[number]

/** Validator for the canonical case-status union (the 7 literals above). */
export const caseStatusValidator = v.union(
	v.literal('Case Received'),
	v.literal('Biometrics'),
	v.literal('Request for Evidence'),
	v.literal('Approved'),
	v.literal('Card Is Being Produced'),
	v.literal('Card Was Mailed'),
	v.literal('Card Was Delivered'),
)

/** A single point on a case's status timeline: a status plus the date observed. */
export const caseHistoryEntryValidator = v.object({
	status: caseStatusValidator,
	// ISO 'YYYY-MM-DD' date string (the date convention used across the app).
	date: v.string(),
})

export type CaseHistoryEntry = Infer<typeof caseHistoryEntryValidator>

/** Which v1 form a case tracks, when known (see ADR-0003). */
export const caseFormTypeValidator = v.union(v.literal('i90'), v.literal('i765'))

/**
 * USCIS Receipt Number format: three letters (e.g. IOE, MSC, EAC, WAC, LIN,
 * SRC) followed by ten digits (CONTEXT.md). Matched case-insensitively; callers
 * normalise to uppercase before storing.
 */
export const RECEIPT_NUMBER_REGEX = /^[A-Za-z]{3}\d{10}$/

/** Trim + uppercase a receipt number for storage. */
export function normalizeReceiptNumber(input: string): string {
	return input.trim().toUpperCase()
}

/** Whether `input` is a syntactically valid USCIS Receipt Number. */
export function isValidReceiptNumber(input: string): boolean {
	return RECEIPT_NUMBER_REGEX.test(input.trim())
}

/** Today's date as an ISO 'YYYY-MM-DD' string. */
export function todayIso(): string {
	return new Date().toISOString().slice(0, 10)
}

/**
 * Load a case only if the current caller owns it. Returns `null` for an
 * unauthenticated caller, a missing case, or one owned by someone else — the
 * read-path behaviour, mirroring {@link loadOwnedApplicant}.
 */
export async function loadOwnedCase(
	ctx: QueryCtx | MutationCtx,
	caseId: Id<'cases'>,
): Promise<Doc<'cases'> | null> {
	const ownerId = await getOwnerId(ctx)
	if (ownerId === null) {
		return null
	}
	const theCase = await ctx.db.get(caseId)
	if (theCase === null || theCase.ownerId !== ownerId) {
		return null
	}
	return theCase
}

/**
 * Like {@link loadOwnedCase} but for write paths: throws when the caller is
 * unauthenticated or does not own the case. Mirrors `requireOwnedApplicant`.
 */
export async function requireOwnedCase(
	ctx: MutationCtx,
	caseId: Id<'cases'>,
): Promise<{ ownerId: string; theCase: Doc<'cases'> }> {
	const ownerId = await requireOwnerId(ctx)
	const theCase = await ctx.db.get(caseId)
	if (theCase === null || theCase.ownerId !== ownerId) {
		throw new Error('Case not found')
	}
	return { ownerId, theCase }
}
