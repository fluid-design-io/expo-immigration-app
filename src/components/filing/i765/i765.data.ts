import { useApplicants, type ApplicantProfile } from '@/components/applicants'
import { api } from '@/lib/api'
import { useMutation, useQuery } from 'convex/react'
import type { I765Draft } from './i765.wizard-form'

/**
 * The current account holder's saved I-765 draft (`undefined` while loading,
 * `null` when none exists yet, or the filing document). The Interview restores
 * its answers from this on reload (issue #8).
 */
export function useI765Draft() {
	return useQuery(api.filings.getDraft, { formType: 'i765' })
}

/** Upsert the I-765 draft for the current account holder (autosave + final submit). */
export function useSaveI765Draft() {
	const saveDraft = useMutation(api.filings.saveDraft)
	return (draft: I765Draft) => saveDraft({ formType: 'i765', draft })
}

/** The current account holder's filings (used to surface in-progress drafts). */
export function useFilings() {
	return useQuery(api.filings.listFilings, {})
}

/**
 * The self applicant's saved profile, used to PREFILL the Interview's "About
 * you" step (name + A-Number) and the eligibility category. `undefined` while
 * applicants load; `null` once resolved with no self applicant / no profile.
 */
export function useSelfApplicantProfile(): ApplicantProfile | null | undefined {
	const applicants = useApplicants()
	if (applicants === undefined) {
		return undefined
	}
	const self = applicants.find((applicant) => applicant.relationship === 'self')
	return self?.profile ?? null
}
