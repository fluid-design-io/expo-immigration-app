import { BodyScrollView } from '@/components/core'
import { Stack } from 'expo-router'
import { Card, Spinner, Typography, useThemeColor } from 'heroui-native'
import { View } from 'react-native'
import { type ApplicantDeadline, useDeadlines } from './deadlines.data'

function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

/** One renewal-deadline hero (#5). */
function DeadlineHero({ deadline }: { deadline: ApplicantDeadline }) {
	const { rule, daysUntilExpiry, fileByDate, showAutoExtensionWarning, applicantName } = deadline
	const expired = daysUntilExpiry < 0
	return (
		<Card className="gap-2 p-5">
			<Typography.Paragraph color="muted" className="text-sm">
				{applicantName} · Form {rule.formName}
			</Typography.Paragraph>
			<Typography.Heading className="text-2xl font-bold">
				{expired
					? `Your ${rule.cardLabel} expired ${Math.abs(daysUntilExpiry)} days ago`
					: `Your ${rule.cardLabel} expires in ${daysUntilExpiry} days`}
			</Typography.Heading>
			<Typography.Paragraph>File by {formatDate(fileByDate)}</Typography.Paragraph>
			{showAutoExtensionWarning ? (
				<Typography.Paragraph color="muted" className="mt-1 text-sm">
					⚠︎ No automatic extension for EAD renewals filed on or after Oct 30, 2025 — file early
					to avoid a gap in your work authorization.
				</Typography.Paragraph>
			) : null}
		</Card>
	)
}

/** The Deadlines tab: renewal countdowns derived from each applicant's card (#5). */
export function DeadlinesScreen() {
	const themeColorForeground = useThemeColor('foreground')
	const deadlines = useDeadlines()

	return (
		<>
			<Stack.Title
				large
				largeStyle={{ fontFamily: 'Fredoka_600SemiBold', color: themeColorForeground }}
			>
				Deadlines
			</Stack.Title>
			<BodyScrollView>
				<View className="gap-4 p-5">
					{deadlines === undefined ? (
						<View className="items-center py-12">
							<Spinner />
						</View>
					) : deadlines.length === 0 ? (
						<Typography.Paragraph color="muted">
							Add an applicant&rsquo;s card type and expiry in the interview to see your renewal
							deadline here.
						</Typography.Paragraph>
					) : (
						deadlines.map((d) => <DeadlineHero key={d.applicantId} deadline={d} />)
					)}
				</View>
			</BodyScrollView>
		</>
	)
}
