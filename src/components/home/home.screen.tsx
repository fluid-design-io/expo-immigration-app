import {
	formatIsoDate,
	progressLabel,
	relativeTime,
	requirementLabel,
	situationLabel,
} from '@/components/applications'
import { BodyScrollView } from '@/components/core'
import { styledIcon } from '@/components/styled-icon'
import { useRouter } from 'expo-router'
import { Button, Card, Chip, Spinner, Typography } from 'heroui-native'
import { Pressable, ScrollView, View } from 'react-native'
import type { ActiveApplication, ActivityItem, AttentionItem } from './home.data'
import { useHomeDashboard } from './home.data'

const ExpiringIcon = styledIcon({ family: 'lucide', name: 'triangle-alert' })
const NeededIcon = styledIcon({ family: 'lucide', name: 'file-plus' })
const ActivityApplicationIcon = styledIcon({ family: 'lucide', name: 'file-text' })
const ActivityDocumentIcon = styledIcon({ family: 'lucide', name: 'paperclip' })
const ActivityCaseIcon = styledIcon({ family: 'lucide', name: 'landmark' })

function todayEyebrow(): string {
	return new Date()
		.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
		.toUpperCase()
}

function SummaryHeadline(props: { expiringCount: number; activeCount: number }) {
	// Mockup direction: calm sentence with the two load-bearing counts bolded.
	return (
		<View className="gap-1">
			<Typography.Paragraph color="muted" className="text-xs tracking-wider">
				{todayEyebrow()}
			</Typography.Paragraph>
			<Typography.Heading className="text-3xl font-semibold leading-10">
				<Typography.Heading className="text-3xl font-normal text-muted">You have </Typography.Heading>
				{`${props.expiringCount} ${props.expiringCount === 1 ? 'document' : 'documents'} expiring`}
				<Typography.Heading className="text-3xl font-normal text-muted"> and </Typography.Heading>
				{`${props.activeCount} active ${props.activeCount === 1 ? 'application' : 'applications'}.`}
			</Typography.Heading>
		</View>
	)
}

function ApplicationCard(props: { application: ActiveApplication }) {
	const router = useRouter()
	const { application } = props
	const label = situationLabel(application.formType, application.applicationKind)
	return (
		<Pressable
			accessibilityRole="button"
			onPress={() => router.push(`/application/${application._id}`)}
		>
			<Card className="w-64">
				<Card.Body className="gap-1">
					<Card.Title>{label.primary}</Card.Title>
					<Card.Description>{application.applicantName}</Card.Description>
					<View className="flex-row items-center gap-2 pt-1">
						<Chip size="sm" variant="soft">
							<Chip.Label>{progressLabel(application)}</Chip.Label>
						</Chip>
						<Typography.Paragraph color="muted" className="text-xs">
							{application.completedStepCount}/{application.totalStepCount}
						</Typography.Paragraph>
					</View>
				</Card.Body>
			</Card>
		</Pressable>
	)
}

function AttentionRow(props: { item: AttentionItem }) {
	const router = useRouter()
	const { item } = props
	if (item.kind === 'documentExpiring') {
		return (
			<Pressable
				accessibilityRole="button"
				onPress={() => router.push('/documents')}
				className="flex-row items-center gap-3 py-2"
			>
				<ExpiringIcon size={20} className="text-danger" />
				<View className="flex-1">
					<Typography.Paragraph className="font-medium">
						{item.label ?? item.documentType} expires {formatIsoDate(item.expiryDate)}
					</Typography.Paragraph>
					<Typography.Paragraph color="muted" className="text-sm">
						{item.applicantName}
						{item.affectsApplicationCount > 0 &&
							` · affects ${item.affectsApplicationCount} ${item.affectsApplicationCount === 1 ? 'application' : 'applications'}`}
					</Typography.Paragraph>
				</View>
			</Pressable>
		)
	}
	return (
		<Pressable
			accessibilityRole="button"
			onPress={() => router.push(`/application/${item.applicationId}`)}
			className="flex-row items-center gap-3 py-2"
		>
			<NeededIcon size={20} className="text-warning" />
			<View className="flex-1">
				<Typography.Paragraph className="font-medium">
					{requirementLabel(item.requirementKey)} needed
				</Typography.Paragraph>
				<Typography.Paragraph color="muted" className="text-sm">
					{item.applicantName} · {situationLabel(item.formType, item.applicationKind).primary}
				</Typography.Paragraph>
			</View>
		</Pressable>
	)
}

function ActivityRow(props: { item: ActivityItem }) {
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

function SectionHeading(props: { title: string; count?: number }) {
	return (
		<View className="flex-row items-center justify-between">
			<Typography.Heading className="text-lg font-semibold">{props.title}</Typography.Heading>
			{props.count !== undefined && (
				<Typography.Paragraph color="muted" className="text-sm">
					{props.count}
				</Typography.Paragraph>
			)}
		</View>
	)
}

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
			<BodyScrollView contentContainerClassName="gap-4 pt-6 px-5">
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
		<BodyScrollView contentContainerClassName="gap-6 pt-4 pb-safe-offset-5">
			<View className="px-5">
				<SummaryHeadline
					expiringCount={dashboard.summary.expiringDocumentsCount}
					activeCount={dashboard.summary.activeApplicationsCount}
				/>
			</View>

			<View className="gap-2">
				<View className="px-5">
					<SectionHeading title="Active applications" count={dashboard.activeApplications.length} />
				</View>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerClassName="gap-3 px-5"
				>
					{dashboard.activeApplications.map((application) => (
						<ApplicationCard key={application._id} application={application} />
					))}
				</ScrollView>
			</View>

			{dashboard.attentionItems.length > 0 && (
				<View className="gap-1 px-5">
					<SectionHeading title="Needs attention" count={dashboard.attentionItems.length} />
					{dashboard.attentionItems.map((item, index) => (
						<AttentionRow key={index} item={item} />
					))}
				</View>
			)}

			{dashboard.recentActivity.length > 0 && (
				<View className="gap-1 px-5">
					<SectionHeading title="Recent activity" />
					{dashboard.recentActivity.map((item, index) => (
						<ActivityRow key={index} item={item} />
					))}
				</View>
			)}

			<View className="px-5">
				<Button variant="secondary" onPress={() => router.push('/new-application')}>
					<Button.Label>Start an application</Button.Label>
				</Button>
			</View>
		</BodyScrollView>
	)
}
