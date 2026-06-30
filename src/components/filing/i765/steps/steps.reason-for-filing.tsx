import { router } from 'expo-router'
import { InterviewStep } from '../../filing.interview-step'
import { useI765Form } from '../i765.context'
import { REASON_FOR_FILING_OPTIONS, reasonForFilingSectionSchema } from '../i765.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step page 1 — why the I-765 is being filed. Scopes the `reasonForFiling`
 * section with `form.FormGroup`, gates Next on the section's strict schema, and
 * advances to the next visible step (validate-then-advance, ADR-0013). Back
 * dismisses the modal.
 */
export function ReasonForFilingStep() {
	const form = useI765Form()
	return (
		<form.FormGroup
			name="reasonForFiling"
			validators={{ onDynamic: reasonForFilingSectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'reasonForFiling')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) => reasonForFilingSectionSchema.safeParse(s.values.reasonForFiling).success}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="Why are you filing Form I-765?"
							helpTitle="Reason for filing"
							help="Pick the option that matches your situation. For an expiring work permit, choose “Renewal of permission to accept employment”. This maps to Form I-765 Part 2."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<form.AppField name="reasonForFiling.reasonForFiling">
								{(field) => (
									<field.RadioGroupField label="Reason for filing" options={REASON_FOR_FILING_OPTIONS} />
								)}
							</form.AppField>
						</InterviewStep>
					)}
				</form.Subscribe>
			)}
		</form.FormGroup>
	)
}
