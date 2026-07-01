import { formatIsoDate } from '@/lib/application-labels'
import { styledIcon } from '@/components/styled-icon'
import { Chip, Typography } from 'heroui-native'
import { View } from 'react-native'
import type { VaultDocument } from './documents.data'

const DocumentIcon = styledIcon({ family: 'lucide', name: 'file-text' })

export const documentTypeLabels: Record<VaultDocument['type'], string> = {
	passport: 'Passport',
	ead: 'EAD card',
	permanentResidentCard: 'Permanent Resident Card',
	i94: 'I-94 record',
	socialSecurityCard: 'Social Security card',
	photo: 'Photo',
	other: 'Document',
}

export function DocumentRow(props: { document: VaultDocument }) {
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
