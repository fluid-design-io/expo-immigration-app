import { router } from 'expo-router'
import { Card, Typography } from 'heroui-native'
import { View } from 'react-native'
import { InterviewStep } from '../../filing.interview-step'

/**
 * The I-751 off-ramp (issue #11 guardrail). Reached only when a conditional
 * (2-year) resident chose *renewal* — they cannot file Form I-90. This terminal
 * step explains that they must file Form I-751 to remove conditions instead, and
 * closes the wizard rather than producing an I-90. (Back lets them revise their
 * answers; e.g. they actually needed a replacement, which I-90 does allow.)
 */
export function I751GuardrailStep() {
	return (
		<InterviewStep
			heading="You’ll need Form I-751, not Form I-90"
			helpTitle="Conditional residents"
			help="A 2-year card is a conditional green card. To keep your permanent resident status you file Form I-751 to remove the conditions — Form I-90 can’t renew a conditional card. Information only, not legal advice."
			onBack={() => router.back()}
			onNext={() => router.dismissTo('/')}
			nextLabel="Close"
		>
			<Card className="gap-3 p-5">
				<Typography.Paragraph className="font-semibold">
					Why we can't continue with Form I-90
				</Typography.Paragraph>
				<Typography.Paragraph color="muted" className="text-sm">
					You told us you have a 2-year (conditional) green card and want to renew it. Conditional
					residents remove the conditions on their status with Form I-751 — usually filed in the 90
					days before the card expires — rather than renewing with Form I-90.
				</Typography.Paragraph>
				<Typography.Paragraph color="muted" className="text-sm">
					If your card was actually lost, stolen, or damaged, go back and choose “Replace” — Form
					I-90 does cover replacing a conditional card.
				</Typography.Paragraph>
				<View className="rounded-xl bg-default p-3">
					<Typography.Paragraph color="muted" className="text-xs">
						This is general information, not legal advice. Check your card’s expiration and category
						before filing.
					</Typography.Paragraph>
				</View>
			</Card>
		</InterviewStep>
	)
}
