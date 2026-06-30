import { Button } from 'heroui-native'
import type { JSX } from 'react'
import { useFormContext } from '../hooks/form-context'

/**
 * Form-level submit button. Subscribes to `canSubmit`/`isSubmitting` so it
 * disables itself while invalid or in-flight without re-rendering the whole form.
 */
export default function SubmitButton({ label = 'Save' }: { label?: string }): JSX.Element {
	const form = useFormContext()
	return (
		<form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
			{({ canSubmit, isSubmitting }) => (
				<Button isDisabled={!canSubmit || isSubmitting} onPress={() => form.handleSubmit()}>
					<Button.Label>{isSubmitting ? 'Saving…' : label}</Button.Label>
				</Button>
			)}
		</form.Subscribe>
	)
}
