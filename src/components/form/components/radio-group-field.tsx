import {
	Description,
	FieldError,
	TextField as HeroTextField,
	Label,
	RadioGroup,
} from 'heroui-native'
import { useFieldContext } from '../hooks/form-context'
import { fieldErrorText } from '../utils'

export type RadioGroupFieldOption = {
	value: string
	label: string
}

export type RadioGroupFieldProps = {
	label: string
	options: RadioGroupFieldOption[]
	description?: string
	isRequired?: boolean
	isDisabled?: boolean
}

/** Radio group bound to a TanStack string field. */
export default function RadioGroupField({
	label,
	options,
	description,
	isRequired,
	isDisabled,
}: RadioGroupFieldProps) {
	const field = useFieldContext<string>()
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
	const error = fieldErrorText(field.state.meta.errors)

	return (
		<HeroTextField isInvalid={isInvalid} isRequired={isRequired} isDisabled={isDisabled}>
			<Label>{label}</Label>
			<RadioGroup
				value={field.state.value}
				// RadioGroup has no blur event, so mark the field touched on change to
				// surface validation just like the text fields do on blur.
				onValueChange={(value) => {
					field.handleChange(value)
					field.handleBlur()
				}}
				isInvalid={isInvalid}
				isDisabled={isDisabled}
			>
				{options.map((option) => (
					<RadioGroup.Item key={option.value} value={option.value}>
						{option.label}
					</RadioGroup.Item>
				))}
			</RadioGroup>
			{description ? <Description>{description}</Description> : null}
			{isInvalid && error ? <FieldError isInvalid>{error}</FieldError> : null}
		</HeroTextField>
	)
}
