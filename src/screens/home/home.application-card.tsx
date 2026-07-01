import { progressLabel, situationLabel } from '@/lib/application-labels'
import { useRouter } from 'expo-router'
import { Card, Chip, Typography } from 'heroui-native'
import { Pressable, View } from 'react-native'
import type { ActiveApplication } from './home.data'

export function ApplicationCard(props: { application: ActiveApplication }) {
	const router = useRouter()
	const { application } = props
	const label = situationLabel(application.formType, application.applicationKind)
	return (
		<Pressable
			accessibilityRole="button"
			onPress={() => router.push(`/application/${application._id}`)}
		>
			<Card className="w-64">
				<Card.Body className="gap-1">
					<Card.Title>{label.primary}</Card.Title>
					<Card.Description>{application.applicantName}</Card.Description>
					<View className="flex-row items-center gap-2 pt-1">
						<Chip size="sm" variant="soft">
							<Chip.Label>{progressLabel(application)}</Chip.Label>
						</Chip>
						<Typography.Paragraph color="muted" className="text-xs">
							{application.completedStepCount}/{application.totalStepCount}
						</Typography.Paragraph>
					</View>
				</Card.Body>
			</Card>
		</Pressable>
	)
}
