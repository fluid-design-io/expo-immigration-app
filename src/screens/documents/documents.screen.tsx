import { BodyScrollView, SectionHeading } from '@/components/core'
import { Spinner, Typography } from 'heroui-native'
import { View } from 'react-native'
import { useVault } from './documents.data'
import { DocumentRow } from './documents.document-row'
import { NeededSlotRow } from './documents.needed-slot-row'

export function DocumentsScreen() {
	const vault = useVault()

	if (vault === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	return (
		<BodyScrollView contentContainerClassName="gap-6 pt-4">
			{vault.neededSlots.length > 0 && (
				<View className="gap-1">
					<SectionHeading title="Needed for your applications" count={vault.neededSlots.length} />
					{vault.neededSlots.map((slot) => (
						<NeededSlotRow key={slot.slotId} slot={slot} />
					))}
				</View>
			)}

			<View className="gap-1">
				<SectionHeading title="Your documents" />
				{vault.documents.length === 0 ? (
					<Typography.Paragraph color="muted">
						Documents you add — passport, EAD, Green Card, I-94 — live here and are reused across
						applications. Capture arrives with the upload sheet.
					</Typography.Paragraph>
				) : (
					vault.documents.map((document) => <DocumentRow key={document._id} document={document} />)
				)}
			</View>
		</BodyScrollView>
	)
}
