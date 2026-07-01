// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { expect, test } from 'vitest'
import { applyI90Fields, fillI90Pdf, I90_PDF_FIELDS, missingRequiredFields } from './i90.pdf.utils'
import { i90FormOpts, type I90Values } from './i90.wizard-form'

const TEMPLATE = readFileSync(
	fileURLToPath(new URL('../../../../assets/forms/i-90.pdf', import.meta.url)),
)

function values(overrides: Partial<I90Values> = {}): I90Values {
	return { ...i90FormOpts.defaultValues, ...overrides }
}

const complete = values({
	reasonForFiling: { reasonForFiling: 'replacement' },
	residency: { residentType: 'tenYear' },
	replacementReason: { replacementReason: 'lost' },
	aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
})

test('applyI90Fields maps name + A-Number onto the real USCIS I-90 fields', async () => {
	const pdf = await PDFDocument.load(TEMPLATE, { ignoreEncryption: true })
	const form = pdf.getForm()
	applyI90Fields(form, complete)

	expect(form.getTextField(I90_PDF_FIELDS.givenName).getText()).toBe('Maria')
	expect(form.getTextField(I90_PDF_FIELDS.familyName).getText()).toBe('Gomez')
	// The "A" is preprinted; only the 9 digits are filled.
	expect(form.getTextField(I90_PDF_FIELDS.aNumber).getText()).toBe('012345678')
})

test('applyI90Fields left-pads an 8-digit A-Number to nine (leading zero kept)', async () => {
	const pdf = await PDFDocument.load(TEMPLATE, { ignoreEncryption: true })
	applyI90Fields(
		pdf.getForm(),
		values({ aboutYou: { givenName: 'A', familyName: 'B', aNumber: 'A12345678' } }),
	)
	expect(pdf.getForm().getTextField(I90_PDF_FIELDS.aNumber).getText()).toBe('012345678')
})

test('fillI90Pdf returns a valid, flattened, watermarked PDF', async () => {
	const bytes = await fillI90Pdf(TEMPLATE, complete)
	expect(bytes.byteLength).toBeGreaterThan(1000)
	const out = await PDFDocument.load(bytes, { ignoreEncryption: true })
	expect(out.getPageCount()).toBeGreaterThan(0)
	expect(out.getForm().getFields()).toHaveLength(0)
})

test('missingRequiredFields flags incomplete sections and is empty when complete', () => {
	expect(missingRequiredFields(complete)).toEqual([])

	const empty = missingRequiredFields(i90FormOpts.defaultValues).map((m) => m.key)
	expect(empty).toContain('reasonForFiling')
	expect(empty).toContain('aboutYou')

	// A renewal never requires a replacement reason.
	const renewal = missingRequiredFields(
		values({
			reasonForFiling: { reasonForFiling: 'renewal' },
			residency: { residentType: 'tenYear' },
			aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
		}),
	).map((m) => m.key)
	expect(renewal).not.toContain('replacementReason')
})
