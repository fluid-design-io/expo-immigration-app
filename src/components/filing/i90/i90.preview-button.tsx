import { Button, Typography } from 'heroui-native'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useI90Form } from './i90.context'
import { missingRequiredFields } from './i90.pdf.utils'
import { I90_FORM_META, openI90Preview } from './i90.preview'
import { isI751Guardrail } from './i90.wizard-form'

/**
 * The free, watermarked preview action on the I-90 Review step (issue #11). Runs
 * the completeness check first — surfacing any missing required sections — then
 * renders the answers onto the real current-edition USCIS Form I-90 and opens the
 * draft in the OS viewer. The caption stamps the edition read from the bundled
 * asset (ADR-0006).
 */
export function I90PreviewButton() {
	const form = useI90Form()
	const [busy, setBusy] = useState(false)

	async function handlePreview(): Promise<void> {
		const values = form.state.values
		// A conditional resident renewing must file Form I-751 — never render an
		// I-90 for them, even if this Review is reached via stack history after the
		// answers changed (the completeness check alone wouldn't catch it).
		if (isI751Guardrail(values)) {
			Alert.alert(
				'File Form I-751 instead',
				'A conditional (2-year) resident renewing files Form I-751 to remove conditions — Form I-90 doesn’t apply, so there’s no I-90 to preview.',
			)
			return
		}
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
			await openI90Preview(values)
		} catch (err) {
			Alert.alert(
				'Could not build preview',
				err instanceof Error ? err.message : 'Please try again.',
			)
		} finally {
			setBusy(false)
		}
	}

	const editionCaption = I90_FORM_META.omb
		? `Official Form I-90 · OMB ${I90_FORM_META.omb}${
				I90_FORM_META.ombExpires ? ` (expires ${I90_FORM_META.ombExpires})` : ''
			}`
		: 'Official Form I-90'

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
