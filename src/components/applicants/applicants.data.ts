import { useMutation, useQuery } from 'convex/react'
import { api } from '@/lib/api'
import type { Applicant } from './applicants.types'

/**
 * The current account holder's applicants. `undefined` while the query is
 * loading; `[]` once resolved with no applicants (or when unauthenticated, since
 * the backend read-path returns empty rather than throwing).
 */
export function useApplicants(): Applicant[] | undefined {
	return useQuery(api.applicants.listApplicants, {})
}

/** Create a new applicant owned by the current account holder. */
export function useCreateApplicant() {
	return useMutation(api.applicants.createApplicant)
}
