import { router } from 'expo-router'
import { InterviewStep } from '../../filing.interview-step'
import { useI90Form } from '../i90.context'
import { REASON_FOR_FILING_OPTIONS, reasonSectionSchema } from '../i90.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step 1 — renew vs replace. Scopes the `reasonForFiling` section, gates Next on
 * the section schema, and advances to the next visible step (which becomes the
 * replacement-reason step for a replacement, or the I-751 off-ramp for a
 * conditional renewal once residency is chosen).
 */
export function ReasonForFilingStep() {
	const form = useI90Form()
	return (
		<form.FormGroup
			name="reasonForFiling"
			validators={{ onDynamic: reasonSectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'reasonForFiling')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) => reasonSectionSchema.safeParse(s.values.reasonForFiling).success}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="Are you renewing or replacing your green card?"
							helpTitle="Renew vs replace"
							help="Choose “Renew” if your card is expiring or has expired. Choose “Replace” if it was lost, stolen, damaged, never received, or your information changed. This maps to Form I-90 Part 2."
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
