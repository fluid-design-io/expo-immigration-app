import { Stack } from 'expo-router'
import { I90Provider } from '@/components/filing/i90'
import { useLayoutStyle } from '@/hooks/use-layout-style'

/**
 * Hosts the I-90 (green-card renewal/replacement) Interview. The provider wraps
 * the nested Stack so every step page shares one form instance, answers persist
 * across the push/pop step navigation, and the draft autosaves to Convex.
 */
export default function FileI90Layout() {
	const layoutStyle = useLayoutStyle()
	return (
		<I90Provider>
			<Stack screenOptions={{ ...layoutStyle, headerShown: true }}>
				<Stack.Screen name="index" options={{ title: 'Renew or replace' }} />
				<Stack.Screen name="residency" options={{ title: 'Resident type' }} />
				<Stack.Screen name="replacement-reason" options={{ title: 'Replacement reason' }} />
				<Stack.Screen name="i751-guardrail" options={{ title: 'Form I-751' }} />
				<Stack.Screen name="about-you" options={{ title: 'About you' }} />
				<Stack.Screen name="review" options={{ title: 'Review' }} />
			</Stack>
		</I90Provider>
	)
}
