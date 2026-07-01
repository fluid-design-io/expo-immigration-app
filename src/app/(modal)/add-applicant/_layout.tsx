import { AddApplicantProvider } from '@/components/filing/add-applicant'
import { useLayoutStyle } from '@/hooks/use-layout-style'
import { Stack } from 'expo-router'

/**
 * Hosts the add-applicant Interview. The provider wraps the nested Stack so every
 * step page shares one form instance (context-at-layout), and answers persist
 * across the push/pop step navigation.
 */
export default function AddApplicantLayout() {
	const layoutStyle = useLayoutStyle()
	return (
		<AddApplicantProvider>
			<Stack screenOptions={{ ...layoutStyle, headerShown: true }}>
				<Stack.Screen name="index" options={{ title: 'Your name' }} />
				<Stack.Screen name="a-number" options={{ title: 'A-Number' }} />
				<Stack.Screen name="card" options={{ title: 'Your card' }} />
				<Stack.Screen name="confirm" options={{ title: 'Confirm' }} />
			</Stack>
		</AddApplicantProvider>
	)
}
