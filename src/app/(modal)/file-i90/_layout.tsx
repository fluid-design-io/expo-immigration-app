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
			<Stack screenOptions={{ ...layoutStyle, headerShown: true, headerTitle: 'I-90 Renewal' }} />
		</I90Provider>
	)
}
