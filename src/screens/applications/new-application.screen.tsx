import { BodyScrollView } from '@/components/core'
import { useAppForm } from '@/components/form'
import { situationLabel } from '@/lib/application-labels'
import { Spinner, Typography } from 'heroui-native'
import { Alert, View } from 'react-native'
import {
	NEW_DEPENDENT_CHOICE,
	SELF_CHOICE,
	situationKey,
	supportedSituations,
	useNewApplicationSubmit,
	type NewApplicationValues,
} from './new-application.data'

const required = ({ value }: { value: string }) => (value ? undefined : 'Choose an option')

export function NewApplicationScreen() {
	const { applicants, selfApplicant, dependents, submit } = useNewApplicationSubmit()

	const form = useAppForm({
		defaultValues: {
			applicantChoice: '',
			dependentName: '',
			situationKey: '',
		} satisfies NewApplicationValues,
		onSubmit: async ({ value }) => {
			try {
				await submit(value)
			} catch (error) {
				Alert.alert(
					"Couldn't start the application",
					error instanceof Error ? error.message : 'Please try again.',
				)
			}
		},
	})

	if (applicants === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const applicantOptions = [
		{ value: SELF_CHOICE, label: selfApplicant?.displayName ?? 'Myself' },
		...dependents.map((applicant) => ({ value: applicant._id, label: applicant.displayName })),
		{ value: NEW_DEPENDENT_CHOICE, label: 'Someone else', description: 'Add a family member' },
	]

	const situationOptions = supportedSituations.map((situation) => {
		const label = situationLabel(situation.formType, situation.applicationKind)
		return { value: situationKey(situation), label: label.primary, description: label.secondary }
	})

	return (
		<BodyScrollView contentContainerClassName="py-5 gap-6">
			<View className="gap-1">
				<Typography.Heading>Start an application</Typography.Heading>
				<Typography.Paragraph color="muted">
					Everything is free to prepare — you only pay when you download your filing package.
				</Typography.Paragraph>
			</View>

			<form.AppField
				name="applicantChoice"
				validators={{ onMount: required, onChange: required }}
				listeners={{
					// The name field unmounts when switching away from "Someone
					// else"; reset it so a stale validation error can't keep the
					// form unsubmittable.
					onChange: ({ value }) => {
						if (value !== NEW_DEPENDENT_CHOICE) form.resetField('dependentName')
					},
				}}
			>
				{(field) => (
					<field.RadioGroupField label="Who is this for?" options={applicantOptions} isRequired />
				)}
			</form.AppField>

			<form.Subscribe selector={(state) => state.values.applicantChoice === NEW_DEPENDENT_CHOICE}>
				{(isNewDependent) =>
					isNewDependent ? (
						<form.AppField
							name="dependentName"
							validators={{
								// Requirement depends on the applicant choice, so re-run
								// whenever that field changes (clears a stale error when the
								// user switches back to an existing applicant).
								onChangeListenTo: ['applicantChoice'],
								onChange: ({ value, fieldApi }) =>
									fieldApi.form.getFieldValue('applicantChoice') === NEW_DEPENDENT_CHOICE &&
									value.trim().length === 0
										? 'Enter their name'
										: undefined,
							}}
						>
							{(field) => (
								<field.TextField
									label="Their name"
									placeholder="e.g. Ana Santos"
									isRequired
									autoCapitalize="words"
								/>
							)}
						</form.AppField>
					) : null
				}
			</form.Subscribe>

			<form.AppField name="situationKey" validators={{ onMount: required, onChange: required }}>
				{(field) => (
					<field.RadioGroupField
						label="What do you need to do?"
						options={situationOptions}
						isRequired
					/>
				)}
			</form.AppField>

			<form.AppForm>
				<form.SubmitButton label="Start application" />
			</form.AppForm>
		</BodyScrollView>
	)
}
