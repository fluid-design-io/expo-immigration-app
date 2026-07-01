import { relativeTime, situationLabel } from '@/lib/application-labels'
import { styledIcon } from '@/components/styled-icon'
import { Typography } from 'heroui-native'
import { View } from 'react-native'
import type { ActivityItem } from './home.data'

const ActivityApplicationIcon = styledIcon({ family: 'lucide', name: 'file-text' })
const ActivityDocumentIcon = styledIcon({ family: 'lucide', name: 'paperclip' })
const ActivityCaseIcon = styledIcon({ family: 'lucide', name: 'landmark' })

export function ActivityRow(props: { item: ActivityItem }) {
	const { item } = props
	const title =
		item.kind === 'application'
			? `${situationLabel(item.formType, item.applicationKind).primary} updated`
			: item.kind === 'document'
				? `${item.label ?? item.documentType} added`
				: `Case ${item.receiptNumber} updated`
	const Icon =
		item.kind === 'application'
			? ActivityApplicationIcon
			: item.kind === 'document'
				? ActivityDocumentIcon
				: ActivityCaseIcon
	return (
		<View className="flex-row items-center gap-3 py-2">
			<Icon size={18} className="text-muted" />
			<Typography.Paragraph className="flex-1">{title}</Typography.Paragraph>
			<Typography.Paragraph color="muted" className="text-sm">
				{relativeTime(item.at)}
			</Typography.Paragraph>
		</View>
	)
}
