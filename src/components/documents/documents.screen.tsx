import { formatIsoDate, requirementLabel, situationLabel } from '@/components/applications'
import { BodyScrollView } from '@/components/core'
import { styledIcon } from '@/components/styled-icon'
import { useRouter } from 'expo-router'
import { Chip, Spinner, Typography } from 'heroui-native'
import { Pressable, View } from 'react-native'
import type { VaultDocument } from './documents.data'
import { useVault } from './documents.data'

const DocumentIcon = styledIcon({ family: 'lucide', name: 'file-text' })
const NeededIcon = styledIcon({ family: 'lucide', name: 'file-plus' })

const documentTypeLabels: Record<VaultDocument['type'], string> = {
	passport: 'Passport',
	ead: 'EAD card',
	permanentResidentCard: 'Permanent Resident Card',
	i94: 'I-94 record',
	socialSecurityCard: 'Social Security card',
	photo: 'Photo',
	other: 'Document',
}

function DocumentRow(props: { document: VaultDocument }) {
	const { document } = props
	return (
		<View className={`flex-row items-center gap-3 py-2 ${document.isCurrent ? '' : 'opacity-50'}`}>
			<DocumentIcon size={20} className="text-muted" />
			<View className="flex-1">
				<Typography.Paragraph className="font-medium">
					{document.label ?? documentTypeLabels[document.type]}
				</Typography.Paragraph>
				<Typography.Paragraph color="muted" className="text-sm">
					{document.applicantName}
					{document.expiryDate !== undefined && ` · expires ${formatIsoDate(document.expiryDate)}`}
				</Typography.Paragraph>
			</View>
			{!document.isCurrent && (
				<Chip size="sm" variant="soft">
					<Chip.Label>Replaced</Chip.Label>
				</Chip>
			)}
		</View>
	)
}

export function DocumentsScreen() {
	const router = useRouter()
	const vault = useVault()

	if (vault === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	return (
		<BodyScrollView contentContainerClassName="gap-6 pt-4 px-5 pb-safe-offset-5">
			{vault.neededSlots.length > 0 && (
				<View className="gap-1">
					<Typography.Heading className="text-lg font-semibold">
						Needed for your applications
					</Typography.Heading>
					{vault.neededSlots.map((slot) => (
						<Pressable
							key={slot.slotId}
							accessibilityRole="button"
							onPress={() => router.push(`/application/${slot.applicationId}`)}
							className="flex-row items-center gap-3 py-2"
						>
							<NeededIcon size={20} className="text-warning" />
							<View className="flex-1">
								<Typography.Paragraph className="font-medium">
									{requirementLabel(slot.requirementKey)}
								</Typography.Paragraph>
								<Typography.Paragraph color="muted" className="text-sm">
									{slot.applicantName} ·{' '}
									{situationLabel(slot.formType, slot.applicationKind).primary}
								</Typography.Paragraph>
							</View>
						</Pressable>
					))}
				</View>
			)}

			<View className="gap-1">
				<Typography.Heading className="text-lg font-semibold">Your documents</Typography.Heading>
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
