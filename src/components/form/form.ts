import { createFormHook } from '@tanstack/react-form'
import SubmitButton from './components/submit-button'
import TextAreaField from './components/text-area-field'
import TextField from './components/text-field'
import { fieldContext, formContext } from './hooks/form-context'

// The app's TanStack Form hook, pre-wired with HeroUI-Native field components.
// Add new field types to `fieldComponents` and they become available as
// `field.<Name>` inside `form.AppField` render props (and inside field groups).
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		TextAreaField,
	},
	formComponents: {
		SubmitButton,
	},
})
