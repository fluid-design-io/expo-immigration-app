import { BodyScrollView } from '@/components/core'
import { router, Stack } from 'expo-router'
import { Typography, useThemeColor } from 'heroui-native'

export default function HomeTab() {
	const themeColorForeground = useThemeColor('foreground')
	return (
		<>
			<Stack.Title
				large
				largeStyle={{
					fontFamily: 'Montserrat_600SemiBold',
					color: themeColorForeground,
				}}
			>
				Home
			</Stack.Title>
			<Stack.Toolbar placement="right">
				<Stack.Toolbar.Button icon="person.fill" onPress={() => router.push('/account')} />
			</Stack.Toolbar>

			<BodyScrollView contentContainerClassName="gap-3 pt-4">
				<Typography.Paragraph color="muted">
					No home content is wired in this PoC shell.
				</Typography.Paragraph>
			</BodyScrollView>
		</>
	)
}
