import { withForm } from '@/components/form'
import { InterviewStep } from '../../interview-step'
import { addApplicantFormOpts, nameSectionSchema } from '../wizard-form'

/**
 * Step 1 — legal name. A `withForm` consumer scoped to the `name` section via
 * `form.FormGroup`; the group validates the strict per-step schema on Next and
 * advances through `onGroupSubmit` (validate-then-advance, ADR-0013).
 */
export const NameStep = withForm({
	...addApplicantFormOpts,
	props: {
		onBack: (() => {}) as undefined | (() => void),
		onAdvance: () => {},
	},
	render: function NameStepRender({ form, onBack, onAdvance }) {
		return (
			<form.FormGroup
				name="name"
				validators={{ onDynamic: nameSectionSchema }}
				onGroupSubmit={() => onAdvance()}
			>
				{(group) => (
					<form.Subscribe selector={(s) => nameSectionSchema.safeParse(s.values.name).success}>
						{(canAdvance) => (
							<InterviewStep
								heading="What's your legal name?"
								helpTitle="Use your legal name"
								help="Enter your name exactly as it appears on your government documents — passport, green card, or work permit. USCIS matches every filing to the name already on record."
								onBack={onBack}
								onNext={() => group.handleSubmit()}
								canAdvance={canAdvance}
							>
								<form.AppField name="name.givenName">
									{(field) => (
										<field.TextField
											label="First (given) name"
											isRequired
											autoCapitalize="words"
											focusNextOnSubmit
										/>
									)}
								</form.AppField>
								<form.AppField name="name.familyName">
									{(field) => (
										<field.TextField label="Last (family) name" isRequired autoCapitalize="words" />
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
