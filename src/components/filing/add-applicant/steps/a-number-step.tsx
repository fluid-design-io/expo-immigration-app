import { withForm } from '@/components/form'
import { InterviewStep } from '../../interview-step'
import { addApplicantFormOpts, identitySectionSchema } from '../wizard-form'

/**
 * Step 2 — A-Number. Scoped to the `identity` section; its strict per-step schema
 * reuses the shared A-Number format regex from `profileShape`.
 */
export const ANumberStep = withForm({
	...addApplicantFormOpts,
	props: {
		onBack: (() => {}) as undefined | (() => void),
		onAdvance: () => {},
	},
	render: function ANumberStepRender({ form, onBack, onAdvance }) {
		return (
			<form.FormGroup
				name="identity"
				validators={{ onDynamic: identitySectionSchema }}
				onGroupSubmit={() => onAdvance()}
			>
				{(group) => (
					<form.Subscribe
						selector={(s) => identitySectionSchema.safeParse(s.values.identity).success}
					>
						{(canAdvance) => (
							<InterviewStep
								heading="What's your A-Number?"
								helpTitle="Alien Registration Number"
								help="Your A-Number (e.g. A012345678) is the 8–9 digit number USCIS uses to identify you. Find it on your green card, work permit, or any notice you've received. It stays the same across every filing."
								onBack={onBack}
								onNext={() => group.handleSubmit()}
								canAdvance={canAdvance}
							>
								<form.AppField name="identity.aNumber">
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
							</InterviewStep>
						)}
					</form.Subscribe>
				)}
			</form.FormGroup>
		)
	},
})
