import type { Id } from '@/lib/api'
import { Spinner, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { View } from 'react-native'
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
			<View className="flex-1 items-center justify-center">
				<Spinner />
			</View>
		)
	}

	if (applicant === null) {
		return (
			<View className="flex-1 items-center justify-center px-5">
				<Typography.Paragraph color="muted">Applicant not found.</Typography.Paragraph>
			</View>
		)
	}

	return <ApplicantProfileForm applicant={applicant} />
}
