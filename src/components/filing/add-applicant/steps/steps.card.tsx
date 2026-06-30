import { router } from 'expo-router'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'
import { useAddApplicantForm } from '../add-applicant.context'
import { cardSectionSchema } from '../add-applicant.wizard-form'

const CARD_OPTIONS = [
	{ value: 'ead', label: 'Work permit (EAD)' },
	{ value: 'greenCard', label: 'Green card' },
]

/**
 * Step page 3 — primary card type + expiry, captured as a plain date field (no
 * document upload). The Deadlines tab derives the renewal deadline from it (#5).
 */
export function CardStep() {
	const form = useAddApplicantForm()
	return (
		<form.FormGroup
			name="card"
			validators={{ onDynamic: cardSectionSchema }}
			onGroupSubmit={() => router.push('/add-applicant/confirm')}
		>
			{(group) => (
				<form.Subscribe selector={(s) => cardSectionSchema.safeParse(s.values.card).success}>
					{(canAdvance) => (
						<InterviewStep
							heading="What are you renewing?"
							helpTitle="Your card & expiry"
							help="Pick the card you're renewing and its expiry date (printed on the front). We use it to show your filing deadline — no upload needed yet."
							onBack={() => router.back()}
							onNext={() => group.handleSubmit()}
							canAdvance={canAdvance}
						>
							<View className="gap-5">
								<form.AppField name="card.cardType">
									{(field) => <field.RadioGroupField label="Card type" options={CARD_OPTIONS} />}
								</form.AppField>
								<form.AppField name="card.cardExpiry">
									{(field) => <field.DateField label="Expiry date" />}
								</form.AppField>
							</View>
						</InterviewStep>
					)}
				</form.Subscribe>
			)}
		</form.FormGroup>
	)
}
