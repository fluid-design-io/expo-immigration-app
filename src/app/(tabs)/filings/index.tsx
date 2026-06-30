import { CasesScreen } from '@/components/cases'
import { Stack } from 'expo-router'
import { useThemeColor } from 'heroui-native'
import type { JSX } from 'react'

export default function FilingsTab(): JSX.Element {
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
