import { degrees, type PDFFont, type PDFForm, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import {
	aboutYouSectionSchema,
	type I90Values,
	reasonSectionSchema,
	replacementReasonSectionSchema,
	residencySectionSchema,
} from './i90.wizard-form'

/**
 * Renders the I-90 Interview answers onto the real, current-edition USCIS Form
 * I-90 with pdf-lib, stamped "DRAFT — NOT FOR FILING" (issue #11, on the #9
 * foundation). The bundled template (`assets/forms/i-90.pdf`) is the official
 * form, decrypted and XFA-stripped at build time (`scripts/normalize-uscis-form.py`).
 *
 * Pure (no React Native imports) so the render path is unit-testable;
 * `i90.preview.ts` is the on-device glue.
 */

/** The subset of AcroForm field names we map (issue #11 accepts a subset). */
export const I90_PDF_FIELDS = {
	familyName: 'form1[0].#subform[0].P1_Line3a_FamilyName[0]',
	givenName: 'form1[0].#subform[0].P1_Line3b_GivenName[0]',
	aNumber: 'form1[0].#subform[0].#area[1].P1_Line1_AlienNumber[0]',
} as const

const WATERMARK_TEXT = 'DRAFT — NOT FOR FILING'

/** A required section the user hasn't completed yet, for the pre-preview check. */
export type MissingSection = { key: string; label: string }

/**
 * The required sections still missing/invalid for a complete I-90, so the preview
 * can flag them before rendering. Reuses the wizard's per-section schemas; the
 * replacement-reason section is required only for a replacement.
 */
export function missingRequiredFields(values: I90Values): MissingSection[] {
	const missing: MissingSection[] = []
	if (!reasonSectionSchema.safeParse(values.reasonForFiling).success) {
		missing.push({ key: 'reasonForFiling', label: 'Renewal or replacement' })
	}
	if (!residencySectionSchema.safeParse(values.residency).success) {
		missing.push({ key: 'residency', label: 'Resident type' })
	}
	if (
		values.reasonForFiling.reasonForFiling === 'replacement' &&
		!replacementReasonSectionSchema.safeParse(values.replacementReason).success
	) {
		missing.push({ key: 'replacementReason', label: 'Replacement reason' })
	}
	if (!aboutYouSectionSchema.safeParse(values.aboutYou).success) {
		missing.push({ key: 'aboutYou', label: 'Your legal name and A-Number' })
	}
	return missing
}

/**
 * Set the mapped I-90 fields on a loaded form from the answers. Exported so the
 * render test can assert field values before flattening. Missing fields (edition
 * drift) are skipped rather than throwing.
 */
export function applyI90Fields(form: PDFForm, values: I90Values): void {
	const setText = (name: string, value: string | undefined): void => {
		if (!value) return
		try {
			form.getTextField(name).setText(value)
		} catch {
			// Field absent in this edition — skip (subset map; editions rotate).
		}
	}

	setText(I90_PDF_FIELDS.familyName, values.aboutYou.familyName)
	setText(I90_PDF_FIELDS.givenName, values.aboutYou.givenName)
	// The A-Number box is a 9-digit comb (the "A" is preprinted). Strip the "A"
	// and separators, then left-pad to 9 so an 8-digit A-Number keeps its zero.
	setText(I90_PDF_FIELDS.aNumber, values.aboutYou.aNumber.replace(/\D/g, '').padStart(9, '0'))
}

/** Stamp a diagonal, semi-transparent "DRAFT — NOT FOR FILING" across every page. */
function drawWatermark(pdf: PDFDocument, font: PDFFont): void {
	const size = 26
	const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, size)
	const half = textWidth / 2
	for (const page of pdf.getPages()) {
		const { width, height } = page.getSize()
		page.drawText(WATERMARK_TEXT, {
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

/** Fill + flatten + watermark, returning the built PDFDocument. */
async function buildFilledI90(
	template: Uint8Array | ArrayBuffer | string,
	values: I90Values,
): Promise<PDFDocument> {
	const pdf = await PDFDocument.load(template, { ignoreEncryption: true })
	const font = await pdf.embedFont(StandardFonts.HelveticaBold)

	applyI90Fields(pdf.getForm(), values)
	// Flatten first so the baked field appearances sit under the watermark.
	pdf.getForm().flatten()
	drawWatermark(pdf, font)

	return pdf
}

/** Render the filled, watermarked I-90 to PDF bytes (used by tests + generic callers). */
export async function fillI90Pdf(
	template: Uint8Array | ArrayBuffer | string,
	values: I90Values,
): Promise<Uint8Array> {
	return await (await buildFilledI90(template, values)).save()
}

/** Same render, returned as base64 — what the on-device file writer consumes. */
export async function fillI90PdfBase64(
	template: Uint8Array | ArrayBuffer | string,
	values: I90Values,
): Promise<string> {
	return await (await buildFilledI90(template, values)).saveAsBase64()
}
