import { ApplicantProfileScreen } from '@/components/applicants'
import type { Id } from '@/lib/api'
import { useLocalSearchParams } from 'expo-router'

export default function ApplicantDetailRoute() {
	const { id } = useLocalSearchParams<{ id: string }>()
	return <ApplicantProfileScreen applicantId={id as Id<'applicants'>} />
}
