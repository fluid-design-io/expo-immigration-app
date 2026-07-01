import { BodyScrollView, SectionHeading } from '@/components/core'
import { useRouter } from 'expo-router'
import { Button, Spinner, Typography } from 'heroui-native'
import { ScrollView, View } from 'react-native'
import { ActivityRow } from './home.activity-row'
import { ApplicationCard } from './home.application-card'
import { AttentionRow } from './home.attention-row'
import { useHomeDashboard } from './home.data'
import { SummaryHeadline } from './home.summary-headline'

export function HomeScreen() {
	const router = useRouter()
	const dashboard = useHomeDashboard()

	if (dashboard === undefined) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		)
	}

	const isEmpty =
		dashboard.activeApplications.length === 0 &&
		dashboard.attentionItems.length === 0 &&
		dashboard.recentActivity.length === 0

	if (isEmpty) {
		return (
			<BodyScrollView>
				<Typography.Heading className="text-3xl font-semibold">
					Let's get your renewal moving.
				</Typography.Heading>
				<Typography.Paragraph color="muted" className="text-lg">
					Answer plain-language questions, keep your documents in one place, and never miss a
					deadline. Free to prepare.
				</Typography.Paragraph>
				<Button onPress={() => router.push('/new-application')}>
					<Button.Label>Start an application</Button.Label>
				</Button>
			</BodyScrollView>
		)
	}

	return (
		<BodyScrollView>
			<SummaryHeadline
				expiringCount={dashboard.summary.expiringDocumentsCount}
				activeCount={dashboard.summary.activeApplicationsCount}
			/>

			<View className="gap-2 -mx-5">
				<View className="px-5">
					<SectionHeading title="Active applications" count={dashboard.activeApplications.length} />
				</View>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerClassName="gap-3 px-5 pb-5"
				>
					{dashboard.activeApplications.map((application) => (
						<ApplicationCard key={application._id} application={application} />
					))}
				</ScrollView>
			</View>

			{dashboard.attentionItems.length > 0 && (
				<>
					<SectionHeading title="Needs attention" count={dashboard.attentionItems.length} />
					{dashboard.attentionItems.map((item, index) => (
						<AttentionRow key={index} item={item} />
					))}
				</>
			)}

			{dashboard.recentActivity.length > 0 && (
				<>
					<SectionHeading title="Recent activity" />
					{dashboard.recentActivity.map((item, index) => (
						<ActivityRow key={index} item={item} />
					))}
				</>
			)}

			<Button variant="secondary" onPress={() => router.push('/new-application')}>
				<Button.Label>Start an application</Button.Label>
			</Button>
		</BodyScrollView>
	)
}
