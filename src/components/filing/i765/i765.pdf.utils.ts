import { degrees, type PDFFont, type PDFForm, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import {
	aboutYouSectionSchema,
	eligibilitySectionSchema,
	isStemCategory,
	type I765Values,
	reasonForFilingSectionSchema,
	stemDetailsSectionSchema,
} from './i765.wizard-form'

/**
 * Renders the I-765 Interview answers onto the real, current-edition USCIS form
 * (ADR-0006/0007) with pdf-lib, stamped "DRAFT — NOT FOR FILING". The bundled
 * template (`assets/forms/i-765.pdf`) is the official form, decrypted and
 * XFA-stripped at build time (`scripts/normalize-uscis-form.py`) so pdf-lib can
 * load it and the OS viewer renders the static page content we fill.
 *
 * This module is pure (no React Native imports) so the render path is unit-
 * testable; `i765.preview.ts` is the on-device glue that loads the asset, calls
 * `fillI765Pdf`, and opens the result in the OS viewer.
 */

/**
 * The subset of AcroForm field names we map (issue #9 accepts a subset). Names
 * are the normalized USCIS I-765's fully-qualified field paths.
 */
export const I765_PDF_FIELDS = {
	familyName: 'form1[0].Page1[0].Line1a_FamilyName[0]',
	givenName: 'form1[0].Page1[0].Line1b_GivenName[0]',
	aNumber: 'form1[0].Page2[0].Line7_AlienNumber[0]',
	eligibility1: 'form1[0].Page3[0].#area[1].section_1[0]',
	eligibility2: 'form1[0].Page3[0].#area[1].section_2[0]',
	eligibility3: 'form1[0].Page3[0].#area[1].section_3[0]',
	sevisNumber: 'form1[0].Page3[0].Line26_SEVISnumber[0]',
	degree: 'form1[0].Page3[0].Line27a_Degree[0]',
} as const

/** Reason for filing → the Part 1 checkbox (top→bottom: initial, replacement, renewal). */
export const I765_REASON_CHECKBOX: Record<string, string> = {
	initial: 'form1[0].Page1[0].Part1_Checkbox[0]',
	replacement: 'form1[0].Page1[0].Part1_Checkbox[1]',
	renewal: 'form1[0].Page1[0].Part1_Checkbox[2]',
}

/** Eligibility code → the three Item-27 parenthetical boxes, e.g. (c)(9), (c)(3)(C). */
export const I765_ELIGIBILITY_SECTIONS: Record<string, [string, string, string]> = {
	c08: ['c', '8', ''],
	c09: ['c', '9', ''],
	c3c: ['c', '3', 'C'],
	a12: ['a', '12', ''],
}

const DEGREE_LABEL: Record<string, string> = {
	bachelors: "Bachelor's degree",
	masters: "Master's degree",
	doctorate: 'Doctorate',
}

const WATERMARK_TEXT = 'DRAFT — NOT FOR FILING'

/** A required section the user hasn't completed yet, for the pre-preview check. */
export type MissingSection = { key: string; label: string }

/**
 * The required sections still missing/invalid for a complete I-765, so the
 * preview can flag them before rendering (issue #9 completeness check). Reuses
 * the wizard's per-section schemas; STEM is required only for the (c)(3)(C)
 * branch, mirroring `getVisibleSteps`.
 */
export function missingRequiredFields(values: I765Values): MissingSection[] {
	const missing: MissingSection[] = []
	if (!reasonForFilingSectionSchema.safeParse(values.reasonForFiling).success) {
		missing.push({ key: 'reasonForFiling', label: 'Reason for filing' })
	}
	if (!eligibilitySectionSchema.safeParse(values.eligibility).success) {
		missing.push({ key: 'eligibility', label: 'Eligibility category' })
	}
	if (!aboutYouSectionSchema.safeParse(values.aboutYou).success) {
		missing.push({ key: 'aboutYou', label: 'Your legal name and A-Number' })
	}
	if (
		isStemCategory(values.eligibility.eligibilityCategory) &&
		!stemDetailsSectionSchema.safeParse(values.stemDetails).success
	) {
		missing.push({ key: 'stemDetails', label: 'STEM degree level and SEVIS ID' })
	}
	return missing
}

/**
 * Set the mapped I-765 fields on a loaded form from the answers. Exported so the
 * render test can assert field values before flattening. Missing fields (edition
 * drift) are skipped rather than throwing, so a partial map still renders.
 */
export function applyI765Fields(form: PDFForm, values: I765Values): void {
	const setText = (name: string, value: string | undefined): void => {
		if (!value) return
		try {
			form.getTextField(name).setText(value)
		} catch {
			// Field absent in this edition — skip (subset map, ADR-0006 editions rotate).
		}
	}
	const check = (name: string): void => {
		try {
			form.getCheckBox(name).check()
		} catch {
			/* absent — skip */
		}
	}

	setText(I765_PDF_FIELDS.familyName, values.aboutYou.familyName)
	setText(I765_PDF_FIELDS.givenName, values.aboutYou.givenName)
	// The A-Number box is a 9-digit comb (the "A-" is preprinted on the form), so
	// strip the leading "A" and any separators before filling.
	setText(I765_PDF_FIELDS.aNumber, values.aboutYou.aNumber.replace(/\D/g, ''))

	const reasonBox = I765_REASON_CHECKBOX[values.reasonForFiling.reasonForFiling]
	if (reasonBox) check(reasonBox)

	const sections = I765_ELIGIBILITY_SECTIONS[values.eligibility.eligibilityCategory]
	if (sections) {
		setText(I765_PDF_FIELDS.eligibility1, sections[0])
		setText(I765_PDF_FIELDS.eligibility2, sections[1])
		setText(I765_PDF_FIELDS.eligibility3, sections[2])
	}

	if (isStemCategory(values.eligibility.eligibilityCategory)) {
		setText(I765_PDF_FIELDS.sevisNumber, values.stemDetails.sevisNumber)
		setText(
			I765_PDF_FIELDS.degree,
			DEGREE_LABEL[values.stemDetails.degreeLevel] ?? values.stemDetails.degreeLevel,
		)
	}
}

/** Stamp a diagonal, semi-transparent "DRAFT — NOT FOR FILING" across every page. */
function drawWatermark(pdf: PDFDocument, font: PDFFont): void {
	const size = 26
	const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, size)
	const half = textWidth / 2
	for (const page of pdf.getPages()) {
		const { width, height } = page.getSize()
		page.drawText(WATERMARK_TEXT, {
			// Offset the start so the 45° line is centered on the page.
			x: width / 2 - half * Math.cos(Math.PI / 4),
			y: height / 2 - half * Math.sin(Math.PI / 4),
			size,
			font,
			color: rgb(0.8, 0.12, 0.12),
			rotate: degrees(45),
			opacity: 0.3,
		})
	}
}

/**
 * Fill the bundled I-765 template with the answers, flatten it (so the values are
 * baked and the copy isn't a clean editable form), and stamp the watermark on
 * top. Accepts the template as bytes or a base64 string (pdf-lib loads both), so
 * on-device it can pass the asset's base64 directly.
 */
async function buildFilledI765(
	template: Uint8Array | ArrayBuffer | string,
	values: I765Values,
): Promise<PDFDocument> {
	const pdf = await PDFDocument.load(template, { ignoreEncryption: true })
	const font = await pdf.embedFont(StandardFonts.HelveticaBold)

	applyI765Fields(pdf.getForm(), values)
	// Flatten first so the baked field appearances sit under the watermark.
	pdf.getForm().flatten()
	drawWatermark(pdf, font)

	return pdf
}

/** Render the filled, watermarked I-765 to PDF bytes (used by tests + generic callers). */
export async function fillI765Pdf(
	template: Uint8Array | ArrayBuffer | string,
	values: I765Values,
): Promise<Uint8Array> {
	return await (await buildFilledI765(template, values)).save()
}

/** Same render, returned as base64 — what the on-device file writer consumes. */
export async function fillI765PdfBase64(
	template: Uint8Array | ArrayBuffer | string,
	values: I765Values,
): Promise<string> {
	return await (await buildFilledI765(template, values)).saveAsBase64()
}
