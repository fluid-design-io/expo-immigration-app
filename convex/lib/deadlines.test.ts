import { expect, test } from 'vitest'
import { computeDeadline } from './deadlines'

// Expected values are independent, hand-worked literals (day-of-year math),
// not recomputed the way the implementation does it.

test('EAD: file-by is 180 days before expiry and the no-auto-extension warning shows', () => {
	// 2026-06-30 → 2026-12-31 is 184 days; 2026-12-31 is day 365, minus 180 = day 185 = 2026-07-04.
	const d = computeDeadline('ead', '2026-12-31', '2026-06-30')
	expect(d.daysUntilExpiry).toBe(184)
	expect(d.fileByDate).toBe('2026-07-04')
	expect(d.showAutoExtensionWarning).toBe(true)
	expect(d.rule.formName).toBe('I-765')
})

test('Green card: file-by is the expiry date and the warning does NOT show', () => {
	const d = computeDeadline('greenCard', '2026-12-31', '2026-06-30')
	expect(d.daysUntilExpiry).toBe(184)
	expect(d.fileByDate).toBe('2026-12-31')
	expect(d.showAutoExtensionWarning).toBe(false)
	expect(d.rule.formName).toBe('I-90')
})

test('filing window: open within 180 days of expiry, closed before', () => {
	// Expiry 2026-12-31; window opens 2026-07-04 (day 185).
	expect(computeDeadline('ead', '2026-12-31', '2026-07-04').windowOpen).toBe(true)
	expect(computeDeadline('ead', '2026-12-31', '2026-07-03').windowOpen).toBe(false)
})

test('past-due expiry yields negative days remaining', () => {
	const d = computeDeadline('ead', '2026-06-01', '2026-06-30')
	expect(d.daysUntilExpiry).toBe(-29)
})
