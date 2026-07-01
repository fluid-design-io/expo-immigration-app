import { router } from 'expo-router'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useI90Form } from '../i90.context'
import { aboutYouSectionSchema, isI751Guardrail } from '../i90.wizard-form'
import { goToNextStep } from './steps.nav'

/**
 * Step — name + A-Number, prefilled from the self applicant's saved profile
 * (autofill). Reuses the shared shapes for validation. On a valid Next it
 * advances to the Review summary.
 */
export function AboutYouStep() {
	const form = useI90Form()
	return (
		<form.FormGroup
			name="aboutYou"
			validators={{ onDynamic: aboutYouSectionSchema }}
			onGroupSubmit={() => goToNextStep(form.state.values, 'aboutYou')}
		>
			{(group) => (
				<form.Subscribe
					selector={(s) =>
						// If the answers now imply the I-751 guardrail this step is skipped,
						// so don't trap the user here — let Continue advance to the off-ramp.
						isI751Guardrail(s.values) ||
						aboutYouSectionSchema.safeParse(s.values.aboutYou).success
					}
				>
					{(canAdvance) => (
						<InterviewStep
							heading="Confirm your details"
							helpTitle="Pulled from your profile"
							help="We prefilled these from your saved applicant profile. Enter your name and A-Number exactly as they appear on your green card and USCIS documents."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<View className="gap-5">
								<form.AppField name="aboutYou.givenName">
									{(field) => (
										<field.TextField
											label="First (given) name"
											isRequired
											autoCapitalize="words"
											focusNextOnSubmit
										/>
									)}
								</form.AppField>
								<form.AppField name="aboutYou.familyName">
									{(field) => (
										<field.TextField label="Last (family) name" isRequired autoCapitalize="words" />
									)}
								</form.AppField>
								<form.AppField name="aboutYou.aNumber">
									{(field) => (
										<field.TextField
											label="A-Number"
											placeholder="A000000000"
											autoCapitalize="characters"
											autoCorrect={false}
											description="The same number across every filing."
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
