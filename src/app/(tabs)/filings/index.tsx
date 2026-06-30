import { CasesScreen } from '@/components/cases'
import { Stack } from 'expo-router'
import { useThemeColor } from 'heroui-native'

export default function FilingsTab() {
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
				Filings
			</Stack.Title>
			<CasesScreen />
		</>
	)
}
