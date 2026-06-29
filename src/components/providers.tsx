import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { HeroUINativeProvider } from 'heroui-native'
import { StatusBar } from 'expo-status-bar'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	unsavedChangesWarning: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ConvexProvider client={convex}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<HeroUINativeProvider>
					{children}
					<StatusBar style="auto" />
				</HeroUINativeProvider>
			</GestureHandlerRootView>
		</ConvexProvider>
	)
}
