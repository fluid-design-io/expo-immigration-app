import { Button, Input, Label, TextField, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useCreateApplicant, type Relationship } from './applicants.data'

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
	{ value: 'self', label: 'Myself' },
	{ value: 'spouse', label: 'Spouse' },
	{ value: 'child', label: 'Child' },
]

/** Inline form to add an applicant. Calls `onAdded` after a successful create. */
export function AddApplicantForm({ onAdded }: { onAdded?: () => void }): JSX.Element {
	const createApplicant = useCreateApplicant()
	const [displayName, setDisplayName] = useState('')
	const [relationship, setRelationship] = useState<Relationship>('self')
	const [pending, setPending] = useState(false)

	async function handleSubmit(): Promise<void> {
		const name = displayName.trim()
		if (name.length === 0) {
			Alert.alert('Name required', 'Enter a name for this applicant.')
			return
		}

		setPending(true)
		try {
			await createApplicant({ displayName: name, relationship })
			setDisplayName('')
			setRelationship('self')
			onAdded?.()
		} catch (err) {
			Alert.alert(
				'Could not add applicant',
				err instanceof Error ? err.message : 'Please try again.',
			)
		} finally {
			setPending(false)
		}
	}

	return (
		<View className="gap-4">
			<TextField>
				<Label>Name</Label>
				<Input
					value={displayName}
					onChangeText={setDisplayName}
					placeholder="e.g. Maria Gomez"
					autoCapitalize="words"
					editable={!pending}
				/>
			</TextField>

			<View className="gap-2">
				<Typography.Paragraph className="text-sm font-medium">Relationship</Typography.Paragraph>
				<View className="flex-row gap-2">
					{RELATIONSHIPS.map((option) => {
						const selected = relationship === option.value
						return (
							<Button
								key={option.value}
								{...(selected ? {} : { variant: 'ghost' as const })}
								className="flex-1"
								isDisabled={pending}
								onPress={() => setRelationship(option.value)}
							>
								<Button.Label>{option.label}</Button.Label>
							</Button>
						)
					})}
				</View>
			</View>

			<Button isDisabled={pending} onPress={handleSubmit}>
				<Button.Label>{pending ? 'Adding…' : 'Add applicant'}</Button.Label>
			</Button>
		</View>
	)
}
