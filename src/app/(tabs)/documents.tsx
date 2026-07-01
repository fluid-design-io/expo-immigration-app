import { BodyScrollView } from '@/components/core'
import { Stack } from 'expo-router'
import { Typography, useThemeColor } from 'heroui-native'

export default function DocumentsTab() {
	const themeColorForeground = useThemeColor('foreground')
	return (
		<>
			<Stack.Title
				large
				largeStyle={{
					fontFamily: 'Fredoka_600SemiBold',
					color: themeColorForeground,
				}}
			>
				Documents
			</Stack.Title>

			<BodyScrollView contentContainerClassName="gap-3 pt-4">
				<Typography.Paragraph color="muted">
					No document content is wired in this PoC shell.
				</Typography.Paragraph>
			</BodyScrollView>
		</>
	)
}
