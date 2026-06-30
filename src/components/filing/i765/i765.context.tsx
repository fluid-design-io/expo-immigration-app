import { useAppForm } from '@/components/form'
import { revalidateLogic } from '@tanstack/react-form'
import { router } from 'expo-router'
import { Spinner } from 'heroui-native'
import { createContext, useContext, type ReactNode } from 'react'
import { Alert, View } from 'react-native'
import { useI765Draft, useSaveI765Draft, useSelfApplicantProfile } from './i765.data'
import {
	buildI765InitialValues,
	i765FullSchema,
	toI765Draft,
	type I765Values,
} from './i765.wizard-form'

/**
 * Owns the single `useAppForm` for the I-765 Interview (ADR-0013) — the exact
 * shape of the add-applicant provider, plus two filing-specific concerns:
 *
 * - PREFILL: the form is built once the saved draft and the self applicant's
 *   profile have loaded, so name/A-Number/eligibility autofill and a reload
 *   restores in-progress answers.
 * - AUTOSAVE: a debounced form-level `onChange` listener upserts the draft to
 *   Convex as the user types, and the final `onSubmit` re-saves before the
 *   wizard closes (no PDF — that's a later issue).
 */
function useI765FormInstance(initialValues: I765Values) {
	const saveDraft = useSaveI765Draft()

	return useAppForm({
		defaultValues: initialValues,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: i765FullSchema },
		listeners: {
			// Best-effort autosave; the final submit re-saves, so swallow errors.
			onChangeDebounceMs: 600,
			onChange: ({ formApi }) => {
				void saveDraft(toI765Draft(formApi.state.values)).catch(() => {})
			},
		},
		onSubmit: async ({ value }) => {
			try {
				await saveDraft(toI765Draft(value))
				router.dismissAll()
			} catch (err) {
				Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.')
			}
		},
	})
}

type I765Form = ReturnType<typeof useI765FormInstance>

const I765Context = createContext<I765Form | null>(null)

/** Mounts the form once `initialValues` are known, then shares it via context. */
function I765FormHost({
	initialValues,
	children,
}: {
	initialValues: I765Values
	children: ReactNode
}) {
	const form = useI765FormInstance(initialValues)
	return <I765Context.Provider value={form}>{children}</I765Context.Provider>
}

export function I765Provider({ children }: { children: ReactNode }) {
	const savedDraft = useI765Draft()
	const profile = useSelfApplicantProfile()

	// Wait for both the draft and the profile to resolve before building the
	// form, so prefill/restore happen on the form's initial values (TanStack Form
	// reads `defaultValues` once on mount).
	if (savedDraft === undefined || profile === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const initialValues = buildI765InitialValues(savedDraft?.draft, profile)
	return <I765FormHost initialValues={initialValues}>{children}</I765FormHost>
}

/** Read the shared I-765 form. Throws when used outside the provider. */
export function useI765Form(): I765Form {
	const form = useContext(I765Context)
	if (form === null) {
		throw new Error('useI765Form must be used within <I765Provider>')
	}
	return form
}
