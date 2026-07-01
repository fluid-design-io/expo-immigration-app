import { BodyScrollView } from '@/components/core'
import { relativeTime } from '@/lib/application-labels'
import type { Id } from '@convex/_generated/dataModel'
import { Separator, Spinner, Typography } from 'heroui-native'
import { View } from 'react-native'
import { useApplicationDetail } from './applications.data'
import { DocumentsSection } from './journey-hub.documents-section'
import { JourneyHubHeader } from './journey-hub.header'
import { PrepareSection } from './journey-hub.prepare-section'
import { ReviewPaySection } from './journey-hub.review-pay-section'
import { TrackSection } from './journey-hub.track-section'

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
	const interviewDone = application.completedStepCount >= application.totalStepCount - 1

	return (
		<BodyScrollView contentContainerClassName="gap-6 pt-4">
			<JourneyHubHeader
				application={application}
				applicantName={applicant?.displayName}
				isUnlocked={isUnlocked}
			/>

			<PrepareSection application={application} interviewDone={interviewDone} />
			<Separator />

			<DocumentsSection requirements={requirements} />
			<Separator />

			<ReviewPaySection
				application={application}
				isUnlocked={isUnlocked}
				interviewDone={interviewDone}
			/>
			<Separator />

			<TrackSection application={application} linkedCase={detail.case} />

			<Typography.Paragraph color="muted" className="text-xs">
				Last saved {relativeTime(draft.updatedAt)}
			</Typography.Paragraph>
		</BodyScrollView>
	)
}
