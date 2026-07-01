import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import type { ApplicationKind, FormType } from '@convex/shared/applicationShapes'
import { supportedSituations } from '@convex/shared/applicationShapes'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export type Situation = { formType: FormType; applicationKind: ApplicationKind }

export { supportedSituations }

export function useApplicationDetail(applicationId: Id<'applications'>) {
	return useQuery(api.applications.getApplication, { applicationId })
}

/**
 * State for the two-choice create flow ("Who is this for?" → situation).
 * Selecting "Myself" is represented by `selfSelected` because the self
 * applicant row may not exist yet — it is created lazily on submit
 * (decision 3).
 */
export function useNewApplicationFlow() {
	const router = useRouter()
	const applicants = useQuery(api.applicants.listApplicants, {})
	const createApplicant = useMutation(api.applicants.createApplicant)
	const createApplication = useMutation(api.applications.createApplication)

	const [selectedApplicantId, setSelectedApplicantId] = useState<Id<'applicants'> | null>(null)
	const [selfSelected, setSelfSelected] = useState(false)
	const [dependentName, setDependentName] = useState('')
	const [situation, setSituation] = useState<Situation | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const selfApplicant = applicants?.find((a) => a.isSelf)
	const addingDependent = !selfSelected && selectedApplicantId === null && dependentName.trim().length > 0
	const canSubmit =
		!submitting &&
		situation !== null &&
		(selfSelected || selectedApplicantId !== null || addingDependent)

	async function submit(): Promise<void> {
		if (!canSubmit || situation === null) return
		setSubmitting(true)
		try {
			let applicantId = selectedApplicantId
			if (applicantId === null) {
				applicantId = selfSelected
					? (selfApplicant?._id ??
						(await createApplicant({ displayName: 'Me', isSelf: true })))
					: await createApplicant({ displayName: dependentName.trim(), isSelf: false })
			}
			const applicationId = await createApplication({ applicantId, ...situation })
			router.dismiss()
			router.push(`/application/${applicationId}`)
		} finally {
			setSubmitting(false)
		}
	}

	return {
		applicants,
		selfApplicant,
		selectedApplicantId,
		selfSelected,
		dependentName,
		situation,
		submitting,
		canSubmit,
		selectSelf: () => {
			setSelfSelected(true)
			setSelectedApplicantId(selfApplicant?._id ?? null)
			setDependentName('')
		},
		selectApplicant: (id: Id<'applicants'>) => {
			setSelectedApplicantId(id)
			setSelfSelected(false)
			setDependentName('')
		},
		setDependentName: (name: string) => {
			setDependentName(name)
			setSelfSelected(false)
			setSelectedApplicantId(null)
		},
		setSituation,
		submit,
	}
}
