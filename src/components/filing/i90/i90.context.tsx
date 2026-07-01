import { revalidateLogic } from '@tanstack/react-form'
import { router } from 'expo-router'
import { Spinner } from 'heroui-native'
import { createContext, useContext, type ReactNode } from 'react'
import { Alert, View } from 'react-native'
import { useAppForm } from '@/components/form'
import { useI90Draft, useSaveI90Draft, useSelfApplicantProfile } from './i90.data'
import { buildI90InitialValues, i90FullSchema, toI90Draft, type I90Values } from './i90.wizard-form'

/**
 * Owns the single `useAppForm` for the I-90 Interview (ADR-0013), mirroring the
 * I-765 provider:
 *
 * - PREFILL: the form is built once the saved draft and the self applicant's
 *   profile have loaded, so name/A-Number autofill and a reload restores answers.
 * - AUTOSAVE: a debounced form-level `onChange` upserts the draft to Convex as
 *   the user types, and the final `onSubmit` re-saves before the wizard closes.
 */
function useI90FormInstance(initialValues: I90Values) {
	const saveDraft = useSaveI90Draft()

	return useAppForm({
		defaultValues: initialValues,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: i90FullSchema },
		listeners: {
			// Best-effort autosave; the final submit re-saves, so swallow errors.
			onChangeDebounceMs: 600,
			onChange: ({ formApi }) => {
				void saveDraft(toI90Draft(formApi.state.values)).catch(() => {})
			},
		},
		onSubmit: async ({ value }) => {
			try {
				await saveDraft(toI90Draft(value))
				router.dismissAll()
			} catch (err) {
				Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.')
			}
		},
	})
}

type I90Form = ReturnType<typeof useI90FormInstance>

const I90Context = createContext<I90Form | null>(null)

/** Mounts the form once `initialValues` are known, then shares it via context. */
function I90FormHost({
	initialValues,
	children,
}: {
	initialValues: I90Values
	children: ReactNode
}) {
	const form = useI90FormInstance(initialValues)
	return <I90Context.Provider value={form}>{children}</I90Context.Provider>
}

export function I90Provider({ children }: { children: ReactNode }) {
	const savedDraft = useI90Draft()
	const profile = useSelfApplicantProfile()

	// Wait for both the draft and the profile before building the form, so
	// prefill/restore happen on the form's initial values (read once on mount).
	if (savedDraft === undefined || profile === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const initialValues = buildI90InitialValues(savedDraft?.draft, profile)
	return <I90FormHost initialValues={initialValues}>{children}</I90FormHost>
}

/** Read the shared I-90 form. Throws when used outside the provider. */
export function useI90Form(): I90Form {
	const form = useContext(I90Context)
	if (form === null) {
		throw new Error('useI90Form must be used within <I90Provider>')
	}
	return form
}
