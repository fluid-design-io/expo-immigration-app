import { AddressFieldGroup, useAppForm } from '@/components/form'
import { router } from 'expo-router'
import { Separator, Typography, useToast } from 'heroui-native'
import { Alert, View } from 'react-native'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { profileFormSchema } from '../../../../convex/lib/profileShape'
import type { Applicant } from '../applicants.types'
import { useUpdateApplicantProfile } from './profile.data'

/**
 * Edit an applicant's reusable profile using the form suite. The fields scroll
 * inside a KeyboardAwareScrollView while the Save action stays sticky above the
 * keyboard (KeyboardStickyView), so it is always reachable.
 */
export function ApplicantProfileForm({ applicant }: { applicant: Applicant }) {
	const updateProfile = useUpdateApplicantProfile()
	const insets = useSafeAreaInsets()
	const { toast } = useToast()
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
		validators: { onSubmit: profileFormSchema },
		onSubmit: async ({ value }) => {
			try {
				await updateProfile({ applicantId: applicant._id, profile: value })
				toast.show({
					label: 'Profile updated',
					variant: 'success',
					placement: 'bottom',
				})
				router.back()
			} catch (err) {
				Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.')
			}
		},
	})

	return (
		<form.AppForm>
			<KeyboardAwareScrollView
				className="flex-1"
				contentContainerClassName="gap-5 px-5 pb-2"
				keyboardDismissMode="on-drag"
				keyboardShouldPersistTaps="handled"
				contentInsetAdjustmentBehavior="automatic"
				bottomOffset={insets.bottom + 64}
			>
				<View className="gap-1">
					<Typography.Heading className="text-2xl font-bold">
						{applicant.displayName}
					</Typography.Heading>
					<Typography.Paragraph color="muted">
						These details autofill this applicant&rsquo;s renewals.
					</Typography.Paragraph>
				</View>
				<form.AppField name="givenName">
					{(field) => (
						<field.TextField
							label="First name"
							isRequired
							autoCapitalize="words"
							focusNextOnSubmit
						/>
					)}
				</form.AppField>
				<form.AppField name="familyName">
					{(field) => (
						<field.TextField
							label="Last name"
							isRequired
							autoCapitalize="words"
							focusNextOnSubmit
						/>
					)}
				</form.AppField>
				<form.AppField name="aNumber">
					{(field) => (
						<field.TextField
							label="A-Number"
							placeholder="A000000000"
							autoCapitalize="characters"
							description="Your Alien Registration Number — the same across every filing."
							focusNextOnSubmit
						/>
					)}
				</form.AppField>
				<form.AppField name="dateOfBirth">
					{(field) => <field.DateField label="Date of birth" placeholder="YYYY-MM-DD" />}
				</form.AppField>
				<form.AppField name="eligibilityCategory">
					{(field) => (
						<field.TextField
							label="EAD eligibility category"
							placeholder="e.g. C08"
							autoCapitalize="characters"
							focusNextOnSubmit
						/>
					)}
				</form.AppField>

				<View className="mt-2 gap-3">
					<Typography.Paragraph className="font-semibold">Mailing address</Typography.Paragraph>
					<AddressFieldGroup form={form} fields="mailingAddress" />
				</View>
			</KeyboardAwareScrollView>

			<KeyboardStickyView className="bg-background" offset={{ opened: insets.bottom }}>
				<Separator />
				<View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
					<form.SubmitButton label="Save profile" />
				</View>
			</KeyboardStickyView>
		</form.AppForm>
	)
}
