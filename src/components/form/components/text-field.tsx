import { Description, FieldError, Input, Label, TextField as HeroTextField } from 'heroui-native'
import type { JSX } from 'react'
import type { TextInputProps } from 'react-native'
import { KeyboardController } from 'react-native-keyboard-controller'
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
				// Ref-free "next field" UX: pressing return moves focus to the next
				// input (keyboard stays up) via react-native-keyboard-controller.
				// Callers can override (e.g. the last field) by passing these props.
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => KeyboardController.setFocusTo('next')}
				{...inputProps}
			/>
			{description ? <Description>{description}</Description> : null}
			{isInvalid && error ? <FieldError isInvalid>{error}</FieldError> : null}
		</HeroTextField>
	)
}
