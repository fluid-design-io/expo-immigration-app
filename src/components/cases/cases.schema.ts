import { z } from 'zod'

/**
 * The canonical USCIS case-status stages in processing order. Mirrors the
 * server-side union in `convex/model/cases.ts` (the source of truth for the
 * stored validator); kept here as a pure list so the RN bundle can order the
 * history timeline and drive the status picker without importing server code.
 */
export const CASE_STATUS_OPTIONS = [
	'Case Received',
	'Biometrics',
	'Request for Evidence',
	'Approved',
	'Card Is Being Produced',
	'Card Was Mailed',
	'Card Was Delivered',
] as const

export type CaseStatusOption = (typeof CASE_STATUS_OPTIONS)[number]

/**
 * USCIS Receipt Number format: three letters (e.g. IOE, MSC, EAC, WAC, LIN,
 * SRC) followed by ten digits (CONTEXT.md). Validated case-insensitively.
 */
export const RECEIPT_NUMBER_REGEX = /^[A-Za-z]{3}\d{10}$/

/** The receipt-entry form: a valid receipt number plus the current status. */
export const receiptFormSchema = z.object({
	receiptNumber: z
		.string()
		.trim()
		.regex(
			RECEIPT_NUMBER_REGEX,
			'Enter a valid Receipt Number: 3 letters then 10 digits (e.g. IOE1234567890).',
		),
	initialStatus: z.enum(CASE_STATUS_OPTIONS),
})

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>
