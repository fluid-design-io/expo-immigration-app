import { SectionHeading } from '@/components/core'
import { styledIcon } from '@/components/styled-icon'
import { requirementLabel } from '@/lib/application-labels'
import { Typography } from 'heroui-native'
import { View } from 'react-native'
import type { ApplicationDetail } from './applications.data'

const AttachedIcon = styledIcon({ family: 'lucide', name: 'circle-check' })
const NeededIcon = styledIcon({ family: 'lucide', name: 'circle-alert' })
const WaivedIcon = styledIcon({ family: 'lucide', name: 'circle-minus' })

export function DocumentsSection(props: { requirements: ApplicationDetail['requirements'] }) {
	const { requirements } = props
	return (
		<View className="gap-2">
			<SectionHeading title="Documents" />
			{requirements.length === 0 && (
				<Typography.Paragraph color="muted">
					No documents are required for this application.
				</Typography.Paragraph>
			)}
			{requirements.map((slot) => (
				<View key={slot._id} className="flex-row items-center gap-3 py-1">
					{slot.status === 'attached' && <AttachedIcon size={20} className="text-success" />}
					{slot.status === 'needed' && <NeededIcon size={20} className="text-warning" />}
					{slot.status === 'waived' && <WaivedIcon size={20} className="text-muted" />}
					<Typography.Paragraph className="flex-1">
						{requirementLabel(slot.requirementKey)}
					</Typography.Paragraph>
					<Typography.Paragraph color="muted" className="text-sm capitalize">
						{slot.status}
					</Typography.Paragraph>
				</View>
			))}
		</View>
	)
}
