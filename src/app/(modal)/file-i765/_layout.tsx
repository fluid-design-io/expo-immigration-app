import { I765Provider } from '@/components/filing/i765'
import { useLayoutStyle } from '@/hooks/use-layout-style'
import { Stack } from 'expo-router'

/**
 * Hosts the I-765 (EAD renewal) Interview. The provider wraps the nested Stack so
 * every step page shares one form instance (context-at-layout), answers persist
 * across the push/pop step navigation, and the draft autosaves to Convex.
 */
export default function FileI765Layout() {
	const layoutStyle = useLayoutStyle()
	return (
		<I765Provider>
			<Stack screenOptions={{ ...layoutStyle, headerShown: true }}>
				<Stack.Screen name="index" options={{ title: 'Reason for filing' }} />
				<Stack.Screen name="eligibility" options={{ title: 'Eligibility category' }} />
				<Stack.Screen name="stem-details" options={{ title: 'STEM details' }} />
				<Stack.Screen name="about-you" options={{ title: 'About you' }} />
				<Stack.Screen name="review" options={{ title: 'Review' }} />
			</Stack>
		</I765Provider>
	)
}
