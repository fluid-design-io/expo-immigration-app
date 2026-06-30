import { Typography } from 'heroui-native'
import type { JSX } from 'react'
import { Alert, View } from 'react-native'
import { z } from 'zod'
import { AddressFieldGroup, useAppForm } from '@/components/form'
import type { Applicant } from './applicants.data'
import { useUpdateApplicantProfile } from './applicants.data'

const profileSchema = z.object({
	givenName: z.string().min(1, 'First name is required'),
	familyName: z.string().min(1, 'Last name is required'),
	aNumber: z.string(),
	dateOfBirth: z.string(),
	eligibilityCategory: z.string(),
	mailingAddress: z.object({
		line1: z.string(),
		city: z.string(),
		state: z.string(),
		postalCode: z.string(),
	}),
})

/**
 * Edit an applicant's reusable profile using the form suite — demonstrates the
 * custom field components plus the reusable Address field group bound to the
 * `mailingAddress` object. Submits via `updateApplicantProfile`.
 */
export function ApplicantProfileForm({ applicant }: { applicant: Applicant }): JSX.Element {
	const updateProfile = useUpdateApplicantProfile()
	const profile = applicant.profile

	const form = useAppForm({
		defaultValues: {
			givenName: profile?.givenName ?? '',
			familyName: profile?.familyName ?? '',
			aNumber: profile?.aNumber ?? '',
			dateOfBirth: profile?.dateOfBirth ?? '',
			eligibilityCategory: profile?.eligibilityCategory ?? '',
			mailingAddress: {
				line1: profile?.mailingAddress?.line1 ?? '',
				city: profile?.mailingAddress?.city ?? '',
				state: profile?.mailingAddress?.state ?? '',
				postalCode: profile?.mailingAddress?.postalCode ?? '',
			},
		},
		validators: { onSubmit: profileSchema },
		onSubmit: async ({ value }) => {
			try {
				await updateProfile({ applicantId: applicant._id, profile: value })
				Alert.alert('Saved', 'Profile updated.')
			} catch (err) {
				Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.')
			}
		},
	})

	return (
		<form.AppForm>
			<View className="gap-4">
				<form.AppField name="givenName">
					{(field) => <field.TextField label="First name" isRequired autoCapitalize="words" />}
				</form.AppField>
				<form.AppField name="familyName">
					{(field) => <field.TextField label="Last name" isRequired autoCapitalize="words" />}
				</form.AppField>
				<form.AppField name="aNumber">
					{(field) => (
						<field.TextField
							label="A-Number"
							placeholder="A000000000"
							autoCapitalize="characters"
							description="Your Alien Registration Number — the same across every filing."
						/>
					)}
				</form.AppField>
				<form.AppField name="dateOfBirth">
					{(field) => <field.TextField label="Date of birth" placeholder="YYYY-MM-DD" />}
				</form.AppField>
				<form.AppField name="eligibilityCategory">
					{(field) => (
						<field.TextField
							label="EAD eligibility category"
							placeholder="e.g. C08"
							autoCapitalize="characters"
						/>
					)}
				</form.AppField>

				<View className="mt-2 gap-3">
					<Typography.Paragraph className="font-semibold">Mailing address</Typography.Paragraph>
					<AddressFieldGroup form={form} fields="mailingAddress" />
				</View>

				<View className="mt-2">
					<form.SubmitButton label="Save profile" />
				</View>
			</View>
		</form.AppForm>
	)
}
