import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getOwnerId, requireOwnerId } from './lib/auth'
import { requireOwnedApplicant } from './model/applicants'
import {
	caseFormTypeValidator,
	caseStatusValidator,
	isValidReceiptNumber,
	loadOwnedCase,
	normalizeReceiptNumber,
	requireOwnedCase,
	todayIso,
} from './model/cases'

/**
 * Start tracking a Case for the current account holder by recording its USCIS
 * Receipt Number and an initial status. The receipt number is validated and
 * normalised to uppercase, and the history timeline is seeded with the initial
 * status so the first observed stage is always on record (ADR-0008). When the
 * case is tied to an applicant, the caller must own that applicant.
 */
export const createCase = mutation({
	args: {
		receiptNumber: v.string(),
		initialStatus: v.optional(caseStatusValidator),
		applicantId: v.optional(v.id('applicants')),
		formType: v.optional(caseFormTypeValidator),
		// Optional ISO 'YYYY-MM-DD'; defaults to today when omitted.
		date: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const ownerId = await requireOwnerId(ctx)

		if (!isValidReceiptNumber(args.receiptNumber)) {
			throw new Error(
				'Enter a valid USCIS Receipt Number: three letters followed by ten digits (e.g. IOE1234567890).',
			)
		}

		// Ownership of a linked applicant is enforced via the shared model helper.
		if (args.applicantId !== undefined) {
			await requireOwnedApplicant(ctx, args.applicantId)
		}

		const status = args.initialStatus ?? 'Case Received'
		const date = args.date ?? todayIso()

		return await ctx.db.insert('cases', {
			ownerId,
			applicantId: args.applicantId,
			formType: args.formType,
			receiptNumber: normalizeReceiptNumber(args.receiptNumber),
			currentStatus: status,
			history: [{ status, date }],
		})
	},
})

/** List the current account holder's cases (empty for an unauthenticated caller). */
export const listCases = query({
	args: {},
	handler: async (ctx) => {
		// Mirror listApplicants: return empty rather than throw when unauthenticated,
		// so the UI can render before auth resolves.
		const ownerId = await getOwnerId(ctx)
		if (ownerId === null) {
			return []
		}
		return await ctx.db
			.query('cases')
			.withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
			.take(50)
	},
})

/** Read a single case, but only if it belongs to the current account holder. */
export const getCase = query({
	args: { caseId: v.id('cases') },
	handler: async (ctx, args) => {
		return await loadOwnedCase(ctx, args.caseId)
	},
})

/**
 * Advance a case the caller owns to a new status: append the new
 * `{ status, date }` to the history timeline and set it as the current status.
 */
export const updateCaseStatus = mutation({
	args: {
		caseId: v.id('cases'),
		status: caseStatusValidator,
		// Optional ISO 'YYYY-MM-DD'; defaults to today when omitted.
		date: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { theCase } = await requireOwnedCase(ctx, args.caseId)
		const date = args.date ?? todayIso()
		await ctx.db.patch(args.caseId, {
			currentStatus: args.status,
			history: [...theCase.history, { status: args.status, date }],
		})
		return null
	},
})
