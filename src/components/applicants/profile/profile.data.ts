import { useMutation, useQuery } from 'convex/react'
import { api, type Id } from '@/lib/api'
import type { Applicant } from '../applicants.types'

/** A single applicant by id (`undefined` while loading, `null` if not found/owned). */
export function useApplicant(applicantId: Id<'applicants'>): Applicant | null | undefined {
	return useQuery(api.applicants.getApplicant, { applicantId })
}

/** Merge profile fields into an applicant the caller owns. */
export function useUpdateApplicantProfile() {
	return useMutation(api.applicants.updateApplicantProfile)
}
