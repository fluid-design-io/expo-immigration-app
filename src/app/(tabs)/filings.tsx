import { Typography } from 'heroui-native'
import type { JSX } from 'react'
import { View } from 'react-native'

export default function FilingsTab(): JSX.Element {
	return (
		<View className="flex-1 justify-center gap-2 bg-background px-6">
			<Typography.Heading className="text-3xl font-bold">Filings</Typography.Heading>
			<Typography.Paragraph color="muted">
				Track your immigration applications and their progress here.
			</Typography.Paragraph>
		</View>
	)
}
