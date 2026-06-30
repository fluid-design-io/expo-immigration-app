import {
	useCreateApplicant,
	useUpdateApplicantProfile,
} from '@/components/applicants/applicants.data'
import { AddApplicantInterview, type AddApplicantDraft } from '@/components/filing'
import { router, Stack } from 'expo-router'

/**
 * Modal route hosting the add-applicant Interview (ADR-0012/0013). On completion
 * it creates a reusable applicant (relationship 'self') under the current
 * anonymous identity, merges the collected profile fields, then dismisses — the
 * Vault tab's `useApplicants` subscription picks it up live.
 */
export default function AddApplicantModal() {
	const createApplicant = useCreateApplicant()
	const updateProfile = useUpdateApplicantProfile()

	async function handleComplete({ displayName, profile }: AddApplicantDraft): Promise<void> {
		const applicantId = await createApplicant({ displayName, relationship: 'self' })
		await updateProfile({ applicantId, profile })
		router.back()
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: true, headerTitle: 'Add yourself' }} />
			<AddApplicantInterview onComplete={handleComplete} onCancel={() => router.back()} />
		</>
	)
}
