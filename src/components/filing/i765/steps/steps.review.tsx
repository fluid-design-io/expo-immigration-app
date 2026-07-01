import { router } from 'expo-router'
import { Card, Typography } from 'heroui-native'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useI765Form } from '../i765.context'
import { I765PreviewButton } from '../i765.preview-button'
import {
	DEGREE_LEVEL_OPTIONS,
	ELIGIBILITY_CATEGORY_OPTIONS,
	getVisibleSteps,
	i765FullSchema,
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
		<form.Subscribe
			selector={(s) => ({
				values: s.values,
				isSubmitting: s.isSubmitting,
				// Gate Finish on the SAME schema the submit runs, so a back-navigation
				// that leaves a visible step incomplete (e.g. cleared STEM answers for a
				// (c)(3)(C) filing) disables Finish rather than failing it silently.
				canFinish: i765FullSchema.safeParse(s.values).success,
			})}
		>
			{({ values, isSubmitting, canFinish }) => {
				const showStem = getVisibleSteps(values).includes('stemDetails')
				const fullName = [values.aboutYou.givenName, values.aboutYou.familyName]
					.filter(Boolean)
					.join(' ')
				return (
					<InterviewStep
						heading="Does this look right?"
						helpTitle="Your I-765 answers"
						help="Preview a free, watermarked draft of your answers on the real USCIS Form I-765, or finish to save and pick up later. The clean, print-ready copy comes later."
						onBack={() => router.back()}
						onNext={() => form.handleSubmit()}
						canAdvance={canFinish && !isSubmitting}
						isNextPending={isSubmitting}
						nextLabel={isSubmitting ? 'Saving…' : 'Finish'}
					>
						<View className="gap-4">
							<Card className="gap-4 p-5">
								<ReviewRow
									label="Reason for filing"
									value={optionLabel(
										REASON_FOR_FILING_OPTIONS,
										values.reasonForFiling.reasonForFiling,
									)}
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
							<I765PreviewButton />
							{!canFinish ? (
								<Typography.Paragraph color="muted" className="text-sm">
									Some answers are still missing. Go back and complete each step to finish.
								</Typography.Paragraph>
							) : null}
						</View>
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
