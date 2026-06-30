import { Description, FieldError, Input, Label, TextField as HeroTextField } from 'heroui-native'
import type { JSX } from 'react'
import type { TextInputProps } from 'react-native'
import { useFieldContext } from '../hooks/form-context'
import { fieldErrorText } from '../utils'

type TextFieldProps = {
	label: string
	description?: string
	isRequired?: boolean
	isDisabled?: boolean
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'editable'>

/** Single-line text field bound to a TanStack string field. */
export default function TextField({
	label,
	description,
	isRequired,
	isDisabled,
	...inputProps
}: TextFieldProps): JSX.Element {
	const field = useFieldContext<string>()
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
	const error = fieldErrorText(field.state.meta.errors)

	return (
		<HeroTextField isInvalid={isInvalid} isRequired={isRequired} isDisabled={isDisabled}>
			<Label>{label}</Label>
			<Input
				value={field.state.value ?? ''}
				onChangeText={field.handleChange}
				onBlur={field.handleBlur}
				editable={!isDisabled}
				{...inputProps}
			/>
			{description ? <Description>{description}</Description> : null}
			{isInvalid && error ? <FieldError isInvalid>{error}</FieldError> : null}
		</HeroTextField>
	)
}
