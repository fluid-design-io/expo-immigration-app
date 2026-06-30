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
			<Stack screenOptions={{ ...layoutStyle, headerShown: true, headerTitle: 'I-765 Renewal' }} />
		</I765Provider>
	)
}
