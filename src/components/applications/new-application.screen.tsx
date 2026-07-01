import { BodyScrollView } from '@/components/core'
import { styledIcon } from '@/components/styled-icon'
import { Button, Input, Spinner, TextField, Typography } from 'heroui-native'
import { Alert, Pressable, View } from 'react-native'
import { situationLabel } from './applications.labels'
import { supportedSituations, useNewApplicationFlow, type Situation } from './applications.data'

const CheckedIcon = styledIcon({ family: 'lucide', name: 'circle-check' })
const UncheckedIcon = styledIcon({ family: 'lucide', name: 'circle' })

function OptionRow(props: {
	selected: boolean
	title: string
	subtitle?: string
	onPress: () => void
}) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ selected: props.selected }}
			onPress={props.onPress}
			className="flex-row items-center gap-3 py-3"
		>
			{props.selected ? (
				<CheckedIcon size={22} className="text-accent" />
			) : (
				<UncheckedIcon size={22} className="text-muted" />
			)}
			<View className="flex-1">
				<Typography.Paragraph className="font-medium">{props.title}</Typography.Paragraph>
				{props.subtitle !== undefined && (
					<Typography.Paragraph color="muted" className="text-sm">
						{props.subtitle}
					</Typography.Paragraph>
				)}
			</View>
		</Pressable>
	)
}

function situationKey(situation: Situation): string {
	return `${situation.formType}:${situation.applicationKind}`
}

export function NewApplicationScreen() {
	const flow = useNewApplicationFlow()

	if (flow.applicants === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const dependents = flow.applicants.filter((a) => !a.isSelf)

	return (
		<BodyScrollView contentContainerClassName="gap-6 pt-6 px-5 pb-safe-offset-5">
			<View className="gap-1">
				<Typography.Heading className="text-2xl font-semibold">
					Start an application
				</Typography.Heading>
				<Typography.Paragraph color="muted">
					Everything is free to prepare — you only pay when you download your filing package.
				</Typography.Paragraph>
			</View>

			<View className="gap-1">
				<Typography.Heading className="text-lg font-semibold">Who is this for?</Typography.Heading>
				<OptionRow
					selected={flow.selfSelected}
					title={flow.selfApplicant?.displayName ?? 'Myself'}
					onPress={flow.selectSelf}
				/>
				{dependents.map((applicant) => (
					<OptionRow
						key={applicant._id}
						selected={flow.selectedApplicantId === applicant._id && !flow.selfSelected}
						title={applicant.displayName}
						onPress={() => flow.selectApplicant(applicant._id)}
					/>
				))}
				<TextField>
					<Input
						placeholder="Someone else — enter their name"
						value={flow.dependentName}
						onChangeText={flow.setDependentName}
					/>
				</TextField>
			</View>

			<View className="gap-1">
				<Typography.Heading className="text-lg font-semibold">
					What do you need to do?
				</Typography.Heading>
				{supportedSituations.map((situation) => {
					const label = situationLabel(situation.formType, situation.applicationKind)
					return (
						<OptionRow
							key={situationKey(situation)}
							selected={flow.situation !== null && situationKey(flow.situation) === situationKey(situation)}
							title={label.primary}
							subtitle={label.secondary}
							onPress={() => flow.setSituation(situation)}
						/>
					)
				})}
			</View>

			<Button
				isDisabled={!flow.canSubmit}
				onPress={() => {
					flow.submit().catch((error: unknown) => {
						Alert.alert(
							"Couldn't start the application",
							error instanceof Error ? error.message : 'Please try again.',
						)
					})
				}}
			>
				<Button.Label>{flow.submitting ? 'Starting…' : 'Start application'}</Button.Label>
			</Button>
		</BodyScrollView>
	)
}
