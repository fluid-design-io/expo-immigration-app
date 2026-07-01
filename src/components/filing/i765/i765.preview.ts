import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import formMeta from '../../../../assets/forms/i-765.meta.json'
import { fillI765PdfBase64 } from './i765.pdf.utils'
import type { I765Values } from './i765.wizard-form'

/**
 * On-device glue for the watermarked I-765 preview (issue #9). Loads the bundled
 * current-edition USCIS template, fills it with the answers via pdf-lib
 * (`i765.pdf.utils.ts`), and opens the "DRAFT — NOT FOR FILING" result in the OS viewer
 * (Quick Look / share sheet). The PDF is generated on demand and never persisted
 * (ADR-0007). Uses the stable legacy expo-file-system API for the base64 round
 * trip pdf-lib expects.
 */

// Metro bundles the normalized template as a static asset (metro.config assetExts).
const TEMPLATE_MODULE = require('../../../../assets/forms/i-765.pdf')

/** Edition signals (OMB #, expiration, source revision) read from the bundled asset. */
export const I765_FORM_META = formMeta

/**
 * Render the answers onto the bundled USCIS form and open the watermarked draft
 * in the OS viewer. Rejects on an asset/render error so the caller can surface it.
 */
export async function openI765Preview(values: I765Values): Promise<void> {
	// 1. Resolve the bundled template and read it as base64 (pdf-lib loads base64).
	const asset = Asset.fromModule(TEMPLATE_MODULE)
	if (!asset.downloaded) {
		await asset.downloadAsync()
	}
	const templateUri = asset.localUri ?? asset.uri
	const templateBase64 = await FileSystem.readAsStringAsync(templateUri, {
		encoding: FileSystem.EncodingType.Base64,
	})

	// 2. Fill + flatten + watermark → base64.
	const outBase64 = await fillI765PdfBase64(templateBase64, values)

	// 3. Write to the cache dir and hand off to the OS viewer.
	const outUri = `${FileSystem.cacheDirectory}i-765-draft-preview.pdf`
	await FileSystem.writeAsStringAsync(outUri, outBase64, {
		encoding: FileSystem.EncodingType.Base64,
	})
	// Fail loudly rather than silently no-op: if the OS viewer/share sheet is
	// unavailable the preview never appears, so the caller must surface an error.
	if (!(await Sharing.isAvailableAsync())) {
		throw new Error('Opening files isn’t available on this device.')
	}
	await Sharing.shareAsync(outUri, {
		mimeType: 'application/pdf',
		UTI: 'com.adobe.pdf',
		dialogTitle: 'Form I-765 — draft preview',
	})
}
