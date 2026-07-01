import { requirementLabel, situationLabel } from '@/lib/application-labels'
import { styledIcon } from '@/components/styled-icon'
import { useRouter } from 'expo-router'
import { Typography } from 'heroui-native'
import { Pressable, View } from 'react-native'
import type { NeededSlot } from './documents.data'

const NeededIcon = styledIcon({ family: 'lucide', name: 'file-plus' })

export function NeededSlotRow(props: { slot: NeededSlot }) {
	const router = useRouter()
	const { slot } = props
	return (
		<Pressable
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
					{slot.applicantName} · {situationLabel(slot.formType, slot.applicationKind).primary}
				</Typography.Paragraph>
			</View>
		</Pressable>
	)
}
