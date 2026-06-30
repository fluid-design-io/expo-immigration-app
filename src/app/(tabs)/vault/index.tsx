import { ApplicantsScreen } from '@/components/applicants'
import { Stack } from 'expo-router'
import { useThemeColor } from 'heroui-native'

export default function VaultRoute() {
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
				Vault
			</Stack.Title>
			<ApplicantsScreen />
		</>
	)
}
