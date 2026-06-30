import { useMutation, useQuery } from 'convex/react'
import { api, type Doc } from '@/lib/api'

/** An applicant document, typed from the Convex schema (server-driven types). */
export type Applicant = Doc<'applicants'>
export type Relationship = Applicant['relationship']

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
