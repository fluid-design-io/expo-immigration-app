import { useQuery } from 'convex/react'
import { api, type Id } from '@/lib/api'
import { computeDeadline, type CardType, type Deadline } from '../../../convex/lib/deadlines'

export type ApplicantDeadline = Deadline & {
	applicantId: Id<'applicants'>
	applicantName: string
}

/**
 * The renewal deadline for every applicant whose profile carries a card type +
 * expiry (captured in the Interview, #5). `undefined` while the query loads.
 * Derives from the shared, pure `computeDeadline` engine (`convex/lib/deadlines`).
 */
export function useDeadlines(): ApplicantDeadline[] | undefined {
	const applicants = useQuery(api.applicants.listApplicants, {})
	if (applicants === undefined) {
		return undefined
	}
	const today = new Date().toISOString().slice(0, 10)
	return applicants
		.filter((a) => a.profile?.cardType && a.profile?.cardExpiry)
		.map((a) => ({
			...computeDeadline(a.profile!.cardType as CardType, a.profile!.cardExpiry as string, today),
			applicantId: a._id,
			applicantName: a.displayName,
		}))
}
