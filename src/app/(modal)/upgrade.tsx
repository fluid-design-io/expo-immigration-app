import { accountGateStore, useAccountGateRequest } from '@/components/account/account-gate-store'
import { InvestedProgressRecap } from '@/components/account/invested-progress-recap'
import { UpgradeActions } from '@/components/account/upgrade-actions'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

/**
 * Full-screen upgrade modal (registered as a root modal in `_layout.tsx`). Used
 * as the `useRequireAccount()` fallback surface when no `AccountGateProvider`
 * hosts the bottom sheet, and reachable directly (e.g. an account-tab "Create
 * account" action). Reuses the same shared recap + upgrade actions, so the
 * anonymous → credentialed link (and its data preservation) is identical.
 */
export default function UpgradeModal() {
	const router = useRouter()
	const request = useAccountGateRequest()
	const settledRef = useRef(false)

	// If the modal is dismissed (swipe/back) without upgrading, park any awaiting
	// gated action so the caller can stop. The settled guard prevents a
	// double-settle once an upgrade has already resolved the gate.
	useEffect(() => {
		return () => {
			if (!settledRef.current) {
				accountGateStore.settle(false)
			}
		}
	}, [])

	function handleUpgraded(): void {
		if (settledRef.current) {
			return
		}
		settledRef.current = true
		accountGateStore.settle(true)
		router.back()
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView
				className="bg-background"
				contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 24 }}
				keyboardShouldPersistTaps="handled"
			>
				<InvestedProgressRecap recap={request?.recap} />
				<UpgradeActions onUpgraded={handleUpgraded} />
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
