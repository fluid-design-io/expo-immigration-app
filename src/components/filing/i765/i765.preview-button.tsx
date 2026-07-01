import { Button, Typography } from 'heroui-native'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useI765Form } from './i765.context'
import { missingRequiredFields } from './i765.pdf.utils'
import { I765_FORM_META, openI765Preview } from './i765.preview'

/**
 * The free, watermarked preview action on the Review step (issue #9). Runs the
 * completeness check first — surfacing any missing required sections — then
 * renders the answers onto the real current-edition USCIS form and opens the
 * draft in the OS viewer. The caption stamps the edition read from the bundled
 * asset (ADR-0006), so it's never hardcoded in the render logic.
 */
export function I765PreviewButton() {
	const form = useI765Form()
	const [busy, setBusy] = useState(false)

	async function handlePreview(): Promise<void> {
		const values = form.state.values
		const missing = missingRequiredFields(values)
		if (missing.length > 0) {
			Alert.alert(
				'A few details are missing',
				`Complete these to preview your form:\n• ${missing.map((m) => m.label).join('\n• ')}`,
			)
			return
		}
		setBusy(true)
		try {
			await openI765Preview(values)
		} catch (err) {
			Alert.alert(
				'Could not build preview',
				err instanceof Error ? err.message : 'Please try again.',
			)
		} finally {
			setBusy(false)
		}
	}

	const editionCaption = I765_FORM_META.omb
		? `Official Form I-765 · OMB ${I765_FORM_META.omb}${
				I765_FORM_META.ombExpires ? ` (expires ${I765_FORM_META.ombExpires})` : ''
			}`
		: 'Official Form I-765'

	return (
		<View className="gap-1.5">
			<Button variant="secondary" isDisabled={busy} onPress={handlePreview}>
				<Button.Label>{busy ? 'Preparing preview…' : 'Preview draft (free)'}</Button.Label>
			</Button>
			<Typography.Paragraph color="muted" className="text-center text-xs">
				{editionCaption}. Watermarked — not for filing.
			</Typography.Paragraph>
		</View>
	)
}
