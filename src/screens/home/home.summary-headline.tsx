import { Typography } from 'heroui-native'
import { View } from 'react-native'

function todayEyebrow(): string {
	return new Date()
		.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
		.toUpperCase()
}

export function SummaryHeadline(props: { expiringCount: number; activeCount: number }) {
	// Mockup direction: calm sentence with the two load-bearing counts bolded.
	return (
		<View className="gap-1 py-5">
			<Typography.Paragraph color="muted" className="text-xs tracking-wider">
				{todayEyebrow()}
			</Typography.Paragraph>
			<Typography.Heading type="h3" className="leading-10">
				<Typography.Heading type="h3" className="text-muted">
					You have{' '}
				</Typography.Heading>
				{`${props.expiringCount} ${props.expiringCount === 1 ? 'document' : 'documents'} expiring`}
				<Typography.Heading type="h3" className="text-muted">
					{' '}
					and{' '}
				</Typography.Heading>
				{`${props.activeCount} active ${props.activeCount === 1 ? 'application' : 'applications'}.`}
			</Typography.Heading>
		</View>
	)
}
