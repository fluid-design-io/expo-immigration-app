import { ApplicantsScreen } from '@/components/applicants'
import { Stack, router } from 'expo-router'
import { Button, useThemeColor } from 'heroui-native'
import { View } from 'react-native'

export default function VaultRoute() {
	const themeColorForeground = useThemeColor('foreground')
	return (
		<View className="flex-1 bg-background">
			<Stack.Title
				large
				largeStyle={{
					fontFamily: 'Fredoka_600SemiBold',
					color: themeColorForeground,
				}}
			>
				Vault
			</Stack.Title>

			{/* Primary entry into the add-applicant Interview (modal). */}
			<View className="px-5 pb-3 pt-1">
				<Button onPress={() => router.push('/add-applicant')}>
					<Button.Label>Add yourself</Button.Label>
				</Button>
			</View>

			<ApplicantsScreen />
		</View>
	)
}
