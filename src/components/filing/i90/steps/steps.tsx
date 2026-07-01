import { AboutYouStep } from './steps.about-you'
import { I751GuardrailStep } from './steps.i751-guardrail'
import { ReasonForFilingStep } from './steps.reason'
import { ReplacementReasonStep } from './steps.replacement-reason'
import { ResidencyStep } from './steps.residency'
import { ReviewStep } from './steps.review'

/**
 * The I-90 Interview steps as one compound namespace. Each step *page* renders a
 * single member and reads the shared form from `useI90Form()`, so no form/
 * navigation props are threaded between routes.
 */
export const Step = {
	ReasonForFiling: ReasonForFilingStep,
	Residency: ResidencyStep,
	ReplacementReason: ReplacementReasonStep,
	I751Guardrail: I751GuardrailStep,
	AboutYou: AboutYouStep,
	Review: ReviewStep,
}
