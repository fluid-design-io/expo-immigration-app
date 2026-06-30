import { Spinner, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { View } from 'react-native'
import type { Id } from '@/lib/api'
import { ApplicantProfileForm } from './applicant-profile-form'
import { useApplicant } from './applicants.data'

/**
 * Detail screen for one applicant: edit their reusable profile. The form owns
 * its own scroll + sticky Save action; the header stays pinned above it.
 */
export function ApplicantProfileScreen({
	applicantId,
}: {
	applicantId: Id<'applicants'>
}): JSX.Element {
	const applicant = useApplicant(applicantId)

	if (applicant === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	if (applicant === null) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-5">
				<Typography.Paragraph color="muted">Applicant not found.</Typography.Paragraph>
			</View>
		)
	}

	return (
		<View className="flex-1 bg-background">
			<View className="gap-1 px-5 pb-2 pt-3">
				<Typography.Heading className="text-2xl font-bold">
					{applicant.displayName}
				</Typography.Heading>
				<Typography.Paragraph color="muted">
					These details autofill this applicant&rsquo;s renewals.
				</Typography.Paragraph>
			</View>
			<ApplicantProfileForm applicant={applicant} />
		</View>
	)
}
