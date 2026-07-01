import { router } from 'expo-router'
import { InterviewStep } from '../../filing.interview-step'
import { useI90Form } from '../i90.context'
import { RESIDENT_TYPE_OPTIONS, residencySectionSchema } from '../i90.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step 2 — resident type (10-year vs conditional 2-year). This is what arms the
 * I-751 guardrail: a conditional resident who chose renewal is routed to the
 * I-751 off-ramp by `goToNextStep` instead of continuing to a filing.
 */
export function ResidencyStep() {
	const form = useI90Form()
	return (
		<form.FormGroup
			name="residency"
			validators={{ onDynamic: residencySectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'residency')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) => residencySectionSchema.safeParse(s.values.residency).success}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="What kind of green card do you have?"
							helpTitle="10-year vs 2-year card"
							help="A 2-year card means you’re a conditional resident. Conditional residents renew by filing Form I-751 (to remove conditions), not Form I-90 — we’ll flag that on the next screen if it applies."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<form.AppField name="residency.residentType">
								{(field) => (
									<field.RadioGroupField label="Resident type" options={RESIDENT_TYPE_OPTIONS} />
								)}
							</form.AppField>
						</InterviewStep>
					)}
				</form.Subscribe>
			)}
		</form.FormGroup>
	)
}
