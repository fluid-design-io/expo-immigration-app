import { BodyScrollView } from '@/components/core'
import { styledIcon } from '@/components/styled-icon'
import type { Id } from '@convex/_generated/dataModel'
import { Button, Chip, Separator, Spinner, Typography } from 'heroui-native'
import { Alert, View } from 'react-native'
import {
	caseStatusLabels,
	progressLabel,
	relativeTime,
	requirementLabel,
	situationLabel,
} from './applications.labels'
import { useApplicationDetail } from './applications.data'

const AttachedIcon = styledIcon({ family: 'lucide', name: 'circle-check' })
const NeededIcon = styledIcon({ family: 'lucide', name: 'circle-alert' })
const WaivedIcon = styledIcon({ family: 'lucide', name: 'circle-minus' })

function SectionHeading(props: { title: string }) {
	return (
		<Typography.Heading className="text-lg font-semibold">{props.title}</Typography.Heading>
	)
}

function comingSoon(feature: string) {
	Alert.alert(feature, 'This part of the walkthrough arrives in the next build phase.')
}

/**
 * The Journey Hub (decision 10): an application's permanent address, owning
 * the Prepare | Documents | Review & Pay | Track spine. Interview and review
 * open as modals from here.
 */
export function JourneyHubScreen(props: { applicationId: Id<'applications'> }) {
	const detail = useApplicationDetail(props.applicationId)

	if (detail === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const { application, applicant, draft, requirements, isUnlocked } = detail
	const label = situationLabel(application.formType, application.applicationKind)
	const isDraft = application.status === 'draft'
	const interviewDone = application.completedStepCount >= application.totalStepCount - 1

	return (
		<BodyScrollView contentContainerClassName="gap-6 pt-4 px-5 pb-safe-offset-5">
			<View className="gap-1">
				<Typography.Paragraph color="muted">{applicant?.displayName}</Typography.Paragraph>
				<Typography.Heading className="text-2xl font-semibold">{label.primary}</Typography.Heading>
				<View className="flex-row items-center gap-2">
					<Typography.Paragraph color="muted" className="text-sm">
						{label.secondary}
					</Typography.Paragraph>
					<Chip size="sm" variant="soft">
						<Chip.Label>{progressLabel({ ...application, isUnlocked })}</Chip.Label>
					</Chip>
				</View>
			</View>

			{/* Prepare */}
			<View className="gap-2">
				<SectionHeading title="Prepare" />
				<Typography.Paragraph color="muted">
					{interviewDone
						? 'Your answers are complete. You can revisit any step before filing.'
						: `Step ${Math.min(application.completedStepCount + 1, application.totalStepCount)} of ${application.totalStepCount} — answer a few plain-language questions.`}
				</Typography.Paragraph>
				{isDraft && (
					<Button variant={interviewDone ? 'secondary' : 'primary'} onPress={() => comingSoon('Interview')}>
						<Button.Label>{interviewDone ? 'Review answers' : 'Continue'}</Button.Label>
					</Button>
				)}
			</View>
			<Separator />

			{/* Documents */}
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
			<Separator />

			{/* Review & Pay */}
			<View className="gap-2">
				<SectionHeading title="Review & Pay" />
				<Typography.Paragraph color="muted">
					{isUnlocked
						? 'Unlocked — download your filing package anytime, edits included.'
						: 'Preview your completed form for free. Pay once to download the print-ready filing package. The government filing fee is separate and paid to USCIS directly.'}
				</Typography.Paragraph>
				{isDraft && (
					<Button
						variant="secondary"
						isDisabled={!interviewDone}
						onPress={() => comingSoon(isUnlocked ? 'Filing package' : 'Preview & pay')}
					>
						<Button.Label>{isUnlocked ? 'Get filing package' : 'Preview & pay'}</Button.Label>
					</Button>
				)}
			</View>
			<Separator />

			{/* Track */}
			<View className="gap-2">
				<SectionHeading title="Track" />
				{detail.case !== null ? (
					<View className="gap-2">
						<View className="flex-row items-center gap-2">
							<Typography.Paragraph className="font-medium">
								{caseStatusLabels[detail.case.status]}
							</Typography.Paragraph>
							<Chip size="sm" variant="soft">
								<Chip.Label>{detail.case.receiptNumber}</Chip.Label>
							</Chip>
						</View>
						{[...detail.case.statusHistory].reverse().map((entry, index) => (
							<View key={`${entry.status}-${index}`} className="flex-row items-center gap-3">
								<Typography.Paragraph color="muted" className="text-sm w-20">
									{relativeTime(entry.occurredAt)}
								</Typography.Paragraph>
								<Typography.Paragraph className="text-sm">
									{caseStatusLabels[entry.status]}
								</Typography.Paragraph>
							</View>
						))}
					</View>
				) : (
					<Typography.Paragraph color="muted">
						{application.status === 'filed'
							? 'Filed. Add your receipt number to track this case — coming with case tracking.'
							: 'After you mail your application, enter the receipt number from your USCIS notice to track it here.'}
					</Typography.Paragraph>
				)}
			</View>

			{draft !== null && (
				<Typography.Paragraph color="muted" className="text-xs">
					Last saved {relativeTime(draft.updatedAt)}
				</Typography.Paragraph>
			)}
		</BodyScrollView>
	)
}
