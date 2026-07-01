import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import formMeta from '../../../../assets/forms/i-90.meta.json'
import { fillI90PdfBase64 } from './i90.pdf.utils'
import type { I90Values } from './i90.wizard-form'

/**
 * On-device glue for the watermarked I-90 preview (issue #11, on the #9
 * foundation). Loads the bundled current-edition USCIS template, fills it with
 * the answers via pdf-lib (`i90.pdf.utils.ts`), and opens the "DRAFT — NOT FOR
 * FILING" result in the OS viewer. Generated on demand, never persisted (ADR-0007).
 */

// Metro bundles the normalized template as a static asset (metro.config assetExts).
const TEMPLATE_MODULE = require('../../../../assets/forms/i-90.pdf')

/** Edition signals (OMB #, expiration, source revision) read from the bundled asset. */
export const I90_FORM_META = formMeta

/**
 * Render the answers onto the bundled USCIS form and open the watermarked draft
 * in the OS viewer. Rejects on an asset/render error, or when no viewer is
 * available, so the caller can surface it rather than silently no-op.
 */
export async function openI90Preview(values: I90Values): Promise<void> {
	const asset = Asset.fromModule(TEMPLATE_MODULE)
	if (!asset.downloaded) {
		await asset.downloadAsync()
	}
	const templateUri = asset.localUri ?? asset.uri
	const templateBase64 = await FileSystem.readAsStringAsync(templateUri, {
		encoding: FileSystem.EncodingType.Base64,
	})

	const outBase64 = await fillI90PdfBase64(templateBase64, values)

	const outUri = `${FileSystem.cacheDirectory}i-90-draft-preview.pdf`
	await FileSystem.writeAsStringAsync(outUri, outBase64, {
		encoding: FileSystem.EncodingType.Base64,
	})
	if (!(await Sharing.isAvailableAsync())) {
		throw new Error('Opening files isn’t available on this device.')
	}
	await Sharing.shareAsync(outUri, {
		mimeType: 'application/pdf',
		UTI: 'com.adobe.pdf',
		dialogTitle: 'Form I-90 — draft preview',
	})
}
