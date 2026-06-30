import { router } from 'expo-router'
import { Card, Typography } from 'heroui-native'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useI765Form } from '../i765.context'
import {
	DEGREE_LEVEL_OPTIONS,
	ELIGIBILITY_CATEGORY_OPTIONS,
	getVisibleSteps,
	optionLabel,
	REASON_FOR_FILING_OPTIONS,
} from '../i765.wizard-form'

/**
 * Final step page — the Review summary. No `FormGroup`: it reads the accumulated
 * answers and calls `form.handleSubmit()`, which runs the lenient full-form
 * schema and the provider's `onSubmit` (a final draft save, then dismiss — no
 * PDF; that's a later issue). The STEM rows show only when that branch was taken.
 */
export function ReviewStep() {
	const form = useI765Form()
	return (
		<form.Subscribe selector={(s) => ({ values: s.values, isSubmitting: s.isSubmitting })}>
			{({ values, isSubmitting }) => {
				const showStem = getVisibleSteps(values).includes('stemDetails')
				const fullName = [values.aboutYou.givenName, values.aboutYou.familyName]
					.filter(Boolean)
					.join(' ')
				return (
					<InterviewStep
						heading="Does this look right?"
						helpTitle="Your I-765 answers"
						help="We’ll save these answers so you can pick up where you left off. Preparing your filled Form I-765 comes in a later step."
						onBack={() => router.back()}
						onNext={() => form.handleSubmit()}
						canAdvance={!isSubmitting}
						isNextPending={isSubmitting}
						nextLabel={isSubmitting ? 'Saving…' : 'Finish'}
					>
						<Card className="gap-4 p-5">
							<ReviewRow
								label="Reason for filing"
								value={optionLabel(REASON_FOR_FILING_OPTIONS, values.reasonForFiling.reasonForFiling)}
							/>
							<ReviewRow
								label="Eligibility category"
								value={optionLabel(
									ELIGIBILITY_CATEGORY_OPTIONS,
									values.eligibility.eligibilityCategory,
								)}
							/>
							{showStem ? (
								<>
									<ReviewRow
										label="Degree level"
										value={optionLabel(DEGREE_LEVEL_OPTIONS, values.stemDetails.degreeLevel)}
									/>
									<ReviewRow label="SEVIS ID" value={values.stemDetails.sevisNumber} />
								</>
							) : null}
							<ReviewRow label="Legal name" value={fullName} />
							<ReviewRow label="A-Number" value={values.aboutYou.aNumber} />
						</Card>
					</InterviewStep>
				)
			}}
		</form.Subscribe>
	)
}

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
