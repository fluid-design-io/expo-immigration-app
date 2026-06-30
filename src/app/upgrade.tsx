import { Typography } from 'heroui-native'
import type { JSX } from 'react'
import { View } from 'react-native'

/**
 * Root-level modal slot (presented above the tab bar via the root Stack).
 * Stub for a later slice — proves the modal presentation pattern.
 */
export default function UpgradeModal(): JSX.Element {
	return (
		<View className="flex-1 justify-center gap-2 bg-background px-6">
			<Typography.Heading className="text-3xl font-bold">Account upgrade</Typography.Heading>
			<Typography.Paragraph color="muted">
				Upgrade options will be presented here.
			</Typography.Paragraph>
		</View>
	)
}
