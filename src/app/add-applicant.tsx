import { router } from 'expo-router'
import type { JSX } from 'react'
import { AddApplicantInterview, type AddApplicantDraft } from '@/components/filing'
import {
	useCreateApplicant,
	useUpdateApplicantProfile,
} from '@/components/applicants/applicants.data'

/**
 * Modal route hosting the add-applicant Interview (ADR-0012/0013). On completion
 * it creates a reusable applicant (relationship 'self') under the current
 * anonymous identity, merges the collected profile fields, then dismisses — the
 * Vault tab's `useApplicants` subscription picks it up live.
 */
export default function AddApplicantModal(): JSX.Element {
	const createApplicant = useCreateApplicant()
	const updateProfile = useUpdateApplicantProfile()

	async function handleComplete({ displayName, profile }: AddApplicantDraft): Promise<void> {
		const applicantId = await createApplicant({ displayName, relationship: 'self' })
		await updateProfile({ applicantId, profile })
		router.back()
	}

	return <AddApplicantInterview onComplete={handleComplete} onCancel={() => router.back()} />
}
