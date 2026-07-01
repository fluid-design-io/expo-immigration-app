import { router } from 'expo-router'
import { InterviewStep } from '../../filing.interview-step'
import { useI90Form } from '../i90.context'
import { REPLACEMENT_REASON_OPTIONS, replacementReasonSectionSchema } from '../i90.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step 3 (branch) — why a replacement is needed. Only shown for a replacement;
 * "never received" and "USCIS error" carry no filing fee. If the reason changed
 * away from replacement (via back-nav) this step is skipped, so Next must not
 * stay gated on its schema — mirror the I-765 hidden-step guard.
 */
export function ReplacementReasonStep() {
	const form = useI90Form()
	return (
		<form.FormGroup
			name="replacementReason"
			validators={{ onDynamic: replacementReasonSectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'replacementReason')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) =>
						s.values.reasonForFiling.reasonForFiling !== 'replacement' ||
						replacementReasonSectionSchema.safeParse(s.values.replacementReason).success
					}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="Why do you need a replacement?"
							helpTitle="Replacement reason"
							help="Pick what happened to your card. If it was never received or has a USCIS error, there’s no USCIS filing fee. This maps to Form I-90 Part 2."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<form.AppField name="replacementReason.replacementReason">
								{(field) => (
									<field.RadioGroupField
										label="Replacement reason"
										options={REPLACEMENT_REASON_OPTIONS}
									/>
								)}
							</form.AppField>
						</InterviewStep>
					)}
				</form.Subscribe>
			)}
		</form.FormGroup>
	)
}
