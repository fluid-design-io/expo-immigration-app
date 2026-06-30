import { router, type Href } from 'expo-router'
import { nextVisibleStepId, type I765StepId, type I765Values } from '../i765.wizard-form'

/** The route (expo-router `Href`) whose page renders each wizard step. */
export function routeForStep(id: I765StepId): Href {
	switch (id) {
		case 'reasonForFiling':
			return '/file-i765'
		case 'eligibility':
			return '/file-i765/eligibility'
		case 'stemDetails':
			return '/file-i765/stem-details'
		case 'aboutYou':
			return '/file-i765/about-you'
		case 'review':
			return '/file-i765/review'
	}
}

/**
 * Advance to the next *visible* step from `current`, honouring the branch in
 * `getVisibleSteps` (the STEM step is skipped unless the category is `(c)(3)(C)`).
 * Mirrors the add-applicant `onGroupSubmit` push, but the destination is derived
 * from the answers rather than hard-coded.
 */
export function goToNextStep(values: I765Values, current: I765StepId): void {
	const next = nextVisibleStepId(values, current)
	if (next) {
		router.push(routeForStep(next))
	}
}
