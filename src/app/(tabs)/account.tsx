import { Typography } from 'heroui-native'
import type { JSX } from 'react'
import { View } from 'react-native'

export default function AccountTab(): JSX.Element {
	return (
		<View className="flex-1 justify-center gap-2 bg-background px-6">
			<Typography.Heading className="text-3xl font-bold">Account</Typography.Heading>
			<Typography.Paragraph color="muted">
				Settings, sign-in, and data export will live here.
			</Typography.Paragraph>
		</View>
	)
}
