// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { expect, test } from 'vitest'
import {
	applyI765Fields,
	fillI765Pdf,
	I765_PDF_FIELDS,
	I765_REASON_CHECKBOX,
	missingRequiredFields,
} from './i765.pdf.utils'
import { i765FormOpts, type I765Values } from './i765.wizard-form'

// The bundled, normalized USCIS template (resolved relative to this file so the
// test is cwd-independent).
const TEMPLATE = readFileSync(
	fileURLToPath(new URL('../../../../assets/forms/i-765.pdf', import.meta.url)),
)

function values(overrides: Partial<I765Values> = {}): I765Values {
	return { ...i765FormOpts.defaultValues, ...overrides }
}

const complete = values({
	reasonForFiling: { reasonForFiling: 'renewal' },
	eligibility: { eligibilityCategory: 'c3c' },
	stemDetails: { degreeLevel: 'masters', sevisNumber: 'N0012345678' },
	aboutYou: { givenName: 'Maria', familyName: 'Gomez', aNumber: 'A012345678' },
})

test('applyI765Fields maps the answers onto the real USCIS form fields', async () => {
	const pdf = await PDFDocument.load(TEMPLATE, { ignoreEncryption: true })
	const form = pdf.getForm()
	applyI765Fields(form, complete)

	expect(form.getTextField(I765_PDF_FIELDS.givenName).getText()).toBe('Maria')
	expect(form.getTextField(I765_PDF_FIELDS.familyName).getText()).toBe('Gomez')
	// The "A-" is preprinted on the form, so only the 9 digits are filled.
	expect(form.getTextField(I765_PDF_FIELDS.aNumber).getText()).toBe('012345678')
	// (c)(3)(C) → the three Item-27 boxes plus the STEM fields.
	expect(form.getTextField(I765_PDF_FIELDS.eligibility1).getText()).toBe('c')
	expect(form.getTextField(I765_PDF_FIELDS.eligibility2).getText()).toBe('3')
	expect(form.getTextField(I765_PDF_FIELDS.eligibility3).getText()).toBe('C')
	expect(form.getTextField(I765_PDF_FIELDS.sevisNumber).getText()).toBe('N0012345678')
	// The renewal reason checkbox is checked; the others are not.
	expect(form.getCheckBox(I765_REASON_CHECKBOX.renewal).isChecked()).toBe(true)
	expect(form.getCheckBox(I765_REASON_CHECKBOX.initial).isChecked()).toBe(false)
})

test('fillI765Pdf returns a valid, flattened, watermarked PDF', async () => {
	const bytes = await fillI765Pdf(TEMPLATE, complete)
	expect(bytes.byteLength).toBeGreaterThan(1000)
	// Re-loads as a valid PDF; flattening removed the interactive form.
	const out = await PDFDocument.load(bytes, { ignoreEncryption: true })
	expect(out.getPageCount()).toBe(7)
	expect(out.getForm().getFields()).toHaveLength(0)
})

test('missingRequiredFields flags incomplete sections and is empty when complete', () => {
	expect(missingRequiredFields(complete)).toEqual([])

	// Empty defaults → the core sections are missing.
	const empty = missingRequiredFields(i765FormOpts.defaultValues).map((m) => m.key)
	expect(empty).toContain('aboutYou')
	expect(empty).toContain('eligibility')

	// A non-STEM category never requires STEM details.
	const nonStem = missingRequiredFields(
		values({ eligibility: { eligibilityCategory: 'c09' } }),
	).map((m) => m.key)
	expect(nonStem).not.toContain('stemDetails')
})
