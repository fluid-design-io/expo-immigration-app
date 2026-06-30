/**
 * Renewal-deadline computation (CONTEXT.md: File-By Date, Filing Window,
 * Auto-Extension). PURE TypeScript — no `convex/server` / `convex/_generated`
 * imports — so it is bundle-safe for both the React Native client (Deadlines
 * tab) and server-only code (future push-reminder cron, #13). `today` is always
 * passed in, so the function is deterministic and unit-testable.
 */

export type CardType = 'ead' | 'greenCard'

export type FilingRule = {
	/** Human label for the physical card. */
	cardLabel: string
	/** The USCIS renewal form. */
	formName: string
	/** Earliest you may file ahead of expiry — the filing window opens here. */
	filingWindowDays: number
	/**
	 * How far before expiry we recommend filing BY. EAD renewals lost the
	 * automatic extension (filed on/after 2025-10-30), so we push filing to the
	 * window open (file ASAP); the I-90 receipt notice extends a green card's
	 * validity, so its file-by sits at the expiry date.
	 */
	recommendedFileByDaysBeforeExpiry: number
	/** Whether a timely-filed renewal auto-extends the expiring card. */
	hasAutoExtension: boolean
}

export const FILING_RULES: Record<CardType, FilingRule> = {
	ead: {
		cardLabel: 'EAD',
		formName: 'I-765',
		filingWindowDays: 180,
		recommendedFileByDaysBeforeExpiry: 180,
		hasAutoExtension: false,
	},
	greenCard: {
		cardLabel: 'Green Card',
		formName: 'I-90',
		filingWindowDays: 180,
		recommendedFileByDaysBeforeExpiry: 0,
		hasAutoExtension: true,
	},
}

export type Deadline = {
	cardType: CardType
	rule: FilingRule
	/** ISO 'YYYY-MM-DD'. */
	expiryDate: string
	/** ISO 'YYYY-MM-DD' — the recommended last date to file. */
	fileByDate: string
	daysUntilExpiry: number
	daysUntilFileBy: number
	/** True once the 180-day filing window has opened. */
	windowOpen: boolean
	/** True when the user should be warned there is no automatic extension (EAD). */
	showAutoExtensionWarning: boolean
}

const MS_PER_DAY = 86_400_000

/** Parse an ISO 'YYYY-MM-DD' date as UTC midnight (timezone-stable). */
function parseISODate(iso: string): number {
	const [y, m, d] = iso.split('-').map(Number)
	return Date.UTC(y, m - 1, d)
}

function toISODate(utcMs: number): string {
	return new Date(utcMs).toISOString().slice(0, 10)
}

function daysBetween(fromMs: number, toMs: number): number {
	return Math.round((toMs - fromMs) / MS_PER_DAY)
}

/** Compute the renewal deadline for a card, relative to `todayISO`. */
export function computeDeadline(cardType: CardType, expiryISO: string, todayISO: string): Deadline {
	const rule = FILING_RULES[cardType]
	const expiry = parseISODate(expiryISO)
	const today = parseISODate(todayISO)
	const fileBy = expiry - rule.recommendedFileByDaysBeforeExpiry * MS_PER_DAY
	const windowOpen = expiry - rule.filingWindowDays * MS_PER_DAY

	return {
		cardType,
		rule,
		expiryDate: expiryISO,
		fileByDate: toISODate(fileBy),
		daysUntilExpiry: daysBetween(today, expiry),
		daysUntilFileBy: daysBetween(today, fileBy),
		windowOpen: today >= windowOpen,
		showAutoExtensionWarning: !rule.hasAutoExtension,
	}
}
