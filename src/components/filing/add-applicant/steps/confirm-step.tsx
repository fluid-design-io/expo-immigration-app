import { withForm } from '@/components/form'
import { Card, Typography } from 'heroui-native'
import { View } from 'react-native'
import { InterviewStep } from '../../interview-step'
import { addApplicantFormOpts, toApplicantDraft } from '../wizard-form'

/**
 * Final step — review then save. No `FormGroup`: it reads the accumulated answers
 * and calls `form.handleSubmit()`, which runs the composed full-form schema and
 * the host's `onSubmit` (create + profile update). Earlier steps already gated
 * validity, so this is the single save point.
 */
export const ConfirmStep = withForm({
	...addApplicantFormOpts,
	props: {
		onBack: (() => {}) as undefined | (() => void),
	},
	render: function ConfirmStepRender({ form, onBack }) {
		return (
			<form.Subscribe selector={(s) => ({ values: s.values, isSubmitting: s.isSubmitting })}>
				{({ values, isSubmitting }) => {
					const draft = toApplicantDraft(values)
					return (
						<InterviewStep
							heading="Does this look right?"
							helpTitle="Saved to your Vault"
							help="We'll save this as a reusable applicant. Your details autofill future renewals, and you can edit them any time from the Vault."
							onBack={onBack}
							onNext={() => form.handleSubmit()}
							canAdvance={!isSubmitting}
							isNextPending={isSubmitting}
							nextLabel={isSubmitting ? 'Saving…' : 'Save applicant'}
						>
							<Card className="gap-4 p-5">
								<ReviewRow label="Legal name" value={draft.displayName} />
								<ReviewRow label="A-Number" value={draft.profile.aNumber} />
							</Card>
						</InterviewStep>
					)
				}}
			</form.Subscribe>
		)
	},
})

function ReviewRow({ label, value }: { label: string; value: string }) {
	return (
		<View className="gap-1">
			<Typography.Paragraph color="muted" className="text-sm">
				{label}
			</Typography.Paragraph>
			<Typography.Paragraph className="font-semibold">{value || '—'}</Typography.Paragraph>
		</View>
	)
}
