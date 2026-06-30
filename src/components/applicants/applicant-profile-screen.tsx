import { Spinner, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Id } from '@/lib/api'
import { ApplicantProfileForm } from './applicant-profile-form'
import { useApplicant } from './applicants.data'

/** Detail screen for one applicant: edit their reusable profile. */
export function ApplicantProfileScreen({
	applicantId,
}: {
	applicantId: Id<'applicants'>
}): JSX.Element {
	const applicant = useApplicant(applicantId)
	const insets = useSafeAreaInsets()

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24, gap: 20 }}
			keyboardShouldPersistTaps="handled"
		>
			{applicant === undefined ? (
				<View className="items-center py-12">
					<Spinner />
				</View>
			) : applicant === null ? (
				<Typography.Paragraph color="muted" className="py-12 text-center">
					Applicant not found.
				</Typography.Paragraph>
			) : (
				<>
					<View className="gap-1">
						<Typography.Heading className="text-2xl font-bold">
							{applicant.displayName}
						</Typography.Heading>
						<Typography.Paragraph color="muted">
							These details autofill this applicant&rsquo;s renewals.
						</Typography.Paragraph>
					</View>
					<ApplicantProfileForm applicant={applicant} />
				</>
			)}
		</ScrollView>
	)
}
