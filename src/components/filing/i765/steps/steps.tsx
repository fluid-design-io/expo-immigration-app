import { AboutYouStep } from './steps.about-you'
import { EligibilityStep } from './steps.eligibility'
import { ReasonForFilingStep } from './steps.reason-for-filing'
import { ReviewStep } from './steps.review'
import { StemDetailsStep } from './steps.stem-details'

/**
 * The I-765 Interview steps as one compound namespace. Each step *page* renders a
 * single member — `<Step.ReasonForFiling />`, `<Step.Eligibility />`,
 * `<Step.StemDetails />`, `<Step.AboutYou />`, `<Step.Review />` — and reads the
 * shared form from `useI765Form()`, so no form/navigation props are threaded
 * between routes.
 */
export const Step = {
	ReasonForFiling: ReasonForFilingStep,
	Eligibility: EligibilityStep,
	StemDetails: StemDetailsStep,
	AboutYou: AboutYouStep,
	Review: ReviewStep,
}
