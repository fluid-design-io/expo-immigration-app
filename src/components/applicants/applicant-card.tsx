import { Link } from 'expo-router'
import { Card, Typography } from 'heroui-native'
import type { JSX } from 'react'
import { Pressable } from 'react-native'
import type { Applicant, Relationship } from './applicants.data'

const RELATIONSHIP_LABEL: Record<Relationship, string> = {
	self: 'You',
	spouse: 'Spouse',
	child: 'Child',
}

function applicantName(applicant: Applicant): string {
	const given = applicant.profile?.givenName
	const family = applicant.profile?.familyName
	const fullName = [given, family].filter(Boolean).join(' ').trim()
	return fullName.length > 0 ? fullName : applicant.displayName
}

export function ApplicantCard({ applicant }: { applicant: Applicant }): JSX.Element {
	const aNumber = applicant.profile?.aNumber
	return (
		<Link href={{ pathname: '/applicant/[id]', params: { id: applicant._id } }} asChild>
			<Pressable>
				<Card className="gap-1 p-4">
					<Typography.Paragraph className="font-semibold">
						{applicantName(applicant)}
					</Typography.Paragraph>
					<Typography.Paragraph color="muted" className="text-sm">
						{RELATIONSHIP_LABEL[applicant.relationship]}
						{aNumber ? ` · A-Number ${aNumber}` : ''}
					</Typography.Paragraph>
				</Card>
			</Pressable>
		</Link>
	)
}
