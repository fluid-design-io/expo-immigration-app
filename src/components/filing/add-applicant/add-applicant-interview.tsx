import { revalidateLogic } from '@tanstack/react-form'
import type { JSX } from 'react'
import { useState } from 'react'
import { Alert } from 'react-native'
import { useAppForm } from '@/components/form'
import { ANumberStep } from './steps/a-number-step'
import { ConfirmStep } from './steps/confirm-step'
import { NameStep } from './steps/name-step'
import { addApplicantFormOpts, addApplicantFullSchema, toApplicantDraft } from './wizard-form'
import type { AddApplicantDraft } from './wizard-form'

type AddApplicantInterviewProps = {
	/**
	 * Persist the assembled applicant. The host runs this from the final step's
	 * `form.handleSubmit()`; the modal route wires it to the create + profile
	 * update mutations and then dismisses.
	 */
	onComplete: (draft: AddApplicantDraft) => Promise<void>
	/** Dismiss the Interview from the first step's Back control. */
	onCancel: () => void
}

const STEP_COUNT = 3

/**
 * Host for the add-applicant Interview — the reusable single-form wizard
 * foundation (ADR-0013). It owns exactly ONE `useAppForm` (keyed per section,
 * `revalidateLogic()`), the visible step index, and swaps `withForm` step
 * components (not a route-per-step) so every answer, cross-step validation, and
 * the single submit payload come for free. Filing wizards reuse this shape.
 */
export function AddApplicantInterview({
	onComplete,
	onCancel,
}: AddApplicantInterviewProps): JSX.Element {
	const [stepIndex, setStepIndex] = useState(0)

	const form = useAppForm({
		...addApplicantFormOpts,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: addApplicantFullSchema },
		onSubmit: async ({ value }) => {
			try {
				await onComplete(toApplicantDraft(value))
			} catch (err) {
				Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.')
			}
		},
	})

	const goNext = () => setStepIndex((i) => Math.min(STEP_COUNT - 1, i + 1))
	const goBack = () => setStepIndex((i) => i - 1)

	switch (stepIndex) {
		case 0:
			return <NameStep form={form} onBack={onCancel} onAdvance={goNext} />
		case 1:
			return <ANumberStep form={form} onBack={goBack} onAdvance={goNext} />
		default:
			return <ConfirmStep form={form} onBack={goBack} />
	}
}
