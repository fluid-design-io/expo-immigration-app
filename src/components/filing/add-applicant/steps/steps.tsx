import { ANumberStep } from './steps.a-number'
import { ConfirmStep } from './steps.confirm'
import { NameStep } from './steps.name'

/**
 * The add-applicant Interview steps as one compound namespace. Each step *page*
 * renders a single member — `<Step.Name />`, `<Step.ANumber />`,
 * `<Step.Confirm />` — and reads the shared form from `useAddApplicantForm()`,
 * so no form/navigation props are threaded between routes.
 */
export const Step = {
	Name: NameStep,
	ANumber: ANumberStep,
	Confirm: ConfirmStep,
}
