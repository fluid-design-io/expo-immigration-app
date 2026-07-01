import { router } from 'expo-router'
import { Card, Typography } from 'heroui-native'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useI90Form } from '../i90.context'
import { I90PreviewButton } from '../i90.preview-button'
import {
	hasUscisFilingFee,
	i90FullSchema,
	optionLabel,
	REASON_FOR_FILING_OPTIONS,
	REPLACEMENT_REASON_OPTIONS,
	RESIDENT_TYPE_OPTIONS,
} from '../i90.wizard-form'

/**
 * Final step — the Review summary. Reads the accumulated answers and calls
 * `form.handleSubmit()`. Finish is gated on the same `i90FullSchema` the submit
 * runs, so an incomplete branch (or the I-751 guardrail) disables it rather than
 * failing silently. Offers the free watermarked preview.
 */
export function ReviewStep() {
	const form = useI90Form()
	return (
		<form.Subscribe
			selector={(s) => ({
				values: s.values,
				isSubmitting: s.isSubmitting,
				canFinish: i90FullSchema.safeParse(s.values).success,
			})}
		>
			{({ values, isSubmitting, canFinish }) => {
				const isReplacement = values.reasonForFiling.reasonForFiling === 'replacement'
				const fullName = [values.aboutYou.givenName, values.aboutYou.familyName]
					.filter(Boolean)
					.join(' ')
				return (
					<InterviewStep
						heading="Does this look right?"
						helpTitle="Your I-90 answers"
						help="Preview a free, watermarked draft on the real USCIS Form I-90, or finish to save and pick up later. The clean, print-ready copy comes later."
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
									value={optionLabel(REASON_FOR_FILING_OPTIONS, values.reasonForFiling.reasonForFiling)}
								/>
								<ReviewRow
									label="Resident type"
									value={optionLabel(RESIDENT_TYPE_OPTIONS, values.residency.residentType)}
								/>
								{isReplacement ? (
									<ReviewRow
										label="Replacement reason"
										value={optionLabel(
											REPLACEMENT_REASON_OPTIONS,
											values.replacementReason.replacementReason,
										)}
									/>
								) : null}
								<ReviewRow label="Legal name" value={fullName} />
								<ReviewRow label="A-Number" value={values.aboutYou.aNumber} />
								<ReviewRow
									label="USCIS filing fee"
									value={
										hasUscisFilingFee(values)
											? 'A USCIS filing fee applies (paid directly to USCIS)'
											: 'No USCIS filing fee for this reason'
									}
								/>
							</Card>
							<I90PreviewButton />
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
