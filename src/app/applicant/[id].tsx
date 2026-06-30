import { useLocalSearchParams } from 'expo-router'
import type { JSX } from 'react'
import { ApplicantProfileScreen } from '@/components/applicants'
import type { Id } from '@/lib/api'

export default function ApplicantDetailRoute(): JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	return <ApplicantProfileScreen applicantId={id as Id<'applicants'>} />
}
