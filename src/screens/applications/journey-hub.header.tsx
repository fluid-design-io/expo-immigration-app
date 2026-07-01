import { progressLabel, situationLabel } from '@/lib/application-labels'
import { Chip, Typography } from 'heroui-native'
import { View } from 'react-native'
import type { ApplicationDetail } from './applications.data'

export function JourneyHubHeader(props: {
	application: ApplicationDetail['application']
	applicantName: string | undefined
	isUnlocked: boolean
}) {
	const { application, applicantName, isUnlocked } = props
	const label = situationLabel(application.formType, application.applicationKind)
	return (
		<View className="gap-1">
			<Typography.Paragraph color="muted">{applicantName}</Typography.Paragraph>
			<Typography.Heading className="text-2xl font-semibold">{label.primary}</Typography.Heading>
			<View className="flex-row items-center gap-2">
				<Typography.Paragraph color="muted" className="text-sm">
					{label.secondary}
				</Typography.Paragraph>
				<Chip size="sm" variant="soft">
					<Chip.Label>{progressLabel({ ...application, isUnlocked })}</Chip.Label>
				</Chip>
			</View>
		</View>
	)
}
