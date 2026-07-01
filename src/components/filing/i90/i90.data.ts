import { useMutation, useQuery } from 'convex/react'
import { useApplicants, type ApplicantProfile } from '@/components/applicants'
import { api } from '@/lib/api'
import type { I90Draft } from './i90.wizard-form'

/**
 * The current account holder's saved I-90 draft (`undefined` while loading,
 * `null` when none exists yet, or the filing document). The Interview restores
 * its answers from this on reload (issue #11).
 */
export function useI90Draft() {
	return useQuery(api.filings.getDraft, { formType: 'i90' })
}

/** Upsert the I-90 draft for the current account holder (autosave + final submit). */
export function useSaveI90Draft() {
	const saveDraft = useMutation(api.filings.saveDraft)
	return (draft: I90Draft) => saveDraft({ formType: 'i90', draft })
}

/**
 * The self applicant's saved profile, used to PREFILL the Interview's "About you"
 * step (name + A-Number). `undefined` while applicants load; `null` once resolved
 * with no self applicant / no profile.
 */
export function useSelfApplicantProfile(): ApplicantProfile | null | undefined {
	const applicants = useApplicants()
	if (applicants === undefined) {
		return undefined
	}
	const self = applicants.find((applicant) => applicant.relationship === 'self')
	return self?.profile ?? null
}
