import { router } from 'expo-router'
import { InterviewStep } from '../../filing.interview-step'
import { useI765Form } from '../i765.context'
import { ELIGIBILITY_CATEGORY_OPTIONS, eligibilitySectionSchema } from '../i765.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step page 2 — eligibility category. THE BRANCH POINT: `onGroupSubmit` advances
 * via `goToNextStep`, which consults `getVisibleSteps` — choosing the STEM OPT
 * category `(c)(3)(C)` routes to the extra STEM details step; every other
 * category skips straight to "About you".
 */
export function EligibilityStep() {
	const form = useI765Form()
	return (
		<form.FormGroup
			name="eligibility"
			validators={{ onDynamic: eligibilitySectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'eligibility')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) => eligibilitySectionSchema.safeParse(s.values.eligibility).success}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="What's your eligibility category?"
							helpTitle="Eligibility category"
							help="This is the code that classifies why you can work (Form I-765 item 27). It’s on your current EAD under “Category”. STEM OPT students — (c)(3)(C) — answer a couple of extra questions next."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<form.AppField name="eligibility.eligibilityCategory">
								{(field) => (
									<field.SelectField
										label="Eligibility category"
										options={ELIGIBILITY_CATEGORY_OPTIONS}
										description="Match the category printed on your card."
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
