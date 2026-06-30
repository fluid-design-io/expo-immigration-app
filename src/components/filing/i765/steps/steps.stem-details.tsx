import { router } from 'expo-router'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useI765Form } from '../i765.context'
import { DEGREE_LEVEL_OPTIONS, isStemCategory, stemDetailsSectionSchema } from '../i765.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Branch step page — STEM OPT details (degree level + SEVIS ID). Only reached
 * when the eligibility category is `(c)(3)(C)`; `getVisibleSteps` skips it for
 * every other category, and the lenient full-form schema never requires it, so a
 * skipped branch can't block submit (ADR-0013).
 */
export function StemDetailsStep() {
	const form = useI765Form()
	return (
		<form.FormGroup
			name="stemDetails"
			validators={{ onDynamic: stemDetailsSectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'stemDetails')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) =>
						// Once the category is no longer (c)(3)(C) this step is skipped
						// (getVisibleSteps/nextVisibleStepId agree), so if it's reached via
						// stack history Continue must not stay gated on STEM validity — let it
						// advance to the next visible step instead of trapping the user.
						!isStemCategory(s.values.eligibility.eligibilityCategory) ||
						stemDetailsSectionSchema.safeParse(s.values.stemDetails).success
					}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="Tell us about your STEM degree"
							helpTitle="STEM OPT extension"
							help="A (c)(3)(C) STEM OPT extension is tied to a qualifying degree and your SEVIS record. Your SEVIS ID starts with “N” followed by 10 digits — it’s on your Form I-20."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<View className="gap-5">
								<form.AppField name="stemDetails.degreeLevel">
									{(field) => (
										<field.SelectField label="Degree level" options={DEGREE_LEVEL_OPTIONS} />
									)}
								</form.AppField>
								<form.AppField name="stemDetails.sevisNumber">
									{(field) => (
										<field.TextField
											label="SEVIS ID number"
											placeholder="N0012345678"
											autoCapitalize="characters"
											autoCorrect={false}
											description="11 characters: the letter N then 10 digits."
										/>
									)}
								</form.AppField>
							</View>
						</InterviewStep>
					)}
				</form.Subscribe>
			)}
		</form.FormGroup>
	)
}
