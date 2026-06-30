import { authClient } from '@/lib/auth-client'
import { useRouter } from 'expo-router'
import { Button, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { useState } from 'react'
import { Alert, View } from 'react-native'

/**
 * Anonymous-first entry point (ADR-0009). "Start filing" silently creates an
 * anonymous Better Auth session — no form, no "guest" wording — and the root
 * guard in `_layout.tsx` flips to the authenticated group, dropping the user
 * straight into the tabs. Returning users push the dedicated sign-in screen.
 */
export default function WelcomeScreen(): JSX.Element {
	const router = useRouter()
	const [pending, setPending] = useState(false)

	async function handleStartFiling(): Promise<void> {
		setPending(true)
		try {
			const { error } = await authClient.signIn.anonymous()
			if (error) {
				Alert.alert(
					"Couldn't start",
					error.message ?? 'Please try again in a moment.',
				)
			}
			// On success the Convex auth state flips to authenticated and the
			// protected route in the root layout redirects into the tabs — there is
			// no manual navigation to do here.
		} catch (err) {
			Alert.alert('Something went wrong', err instanceof Error ? err.message : 'Please try again.')
		} finally {
			setPending(false)
		}
	}

	return (
		<View className="flex-1 justify-between bg-background px-6 pb-12 pt-24">
			<View className="gap-4">
				<Typography.Heading className="text-4xl font-bold">
					Renew with confidence
				</Typography.Heading>
				<Typography.Paragraph color="muted" className="text-lg">
					Track deadlines, organize your documents, and prepare your immigration
					filing — step by step. Start now; create an account only when you're
					ready to submit.
				</Typography.Paragraph>
			</View>

			<View className="gap-3">
				<Button isDisabled={pending} onPress={handleStartFiling}>
					<Button.Label>{pending ? 'Starting…' : 'Start filing'}</Button.Label>
				</Button>

				<Button
					variant="ghost"
					isDisabled={pending}
					onPress={() => router.push('/sign-in')}
				>
					<Button.Label>Sign in</Button.Label>
				</Button>
			</View>
		</View>
	)
}
