import { router, type Href } from 'expo-router'
import { nextVisibleStepId, type I90StepId, type I90Values } from '../i90.wizard-form'

/** The route (expo-router `Href`) whose page renders each wizard step. */
export function routeForStep(id: I90StepId): Href {
	switch (id) {
		case 'reasonForFiling':
			return '/file-i90'
		case 'residency':
			return '/file-i90/residency'
		case 'replacementReason':
			return '/file-i90/replacement-reason'
		case 'i751Guardrail':
			return '/file-i90/i751-guardrail'
		case 'aboutYou':
			return '/file-i90/about-you'
		case 'review':
			return '/file-i90/review'
	}
}

/**
 * Advance to the next *visible* step from `current`, honouring the branches in
 * `getVisibleSteps` (replacement reveals its reason step; a conditional renewal
 * routes to the I-751 off-ramp). The destination is derived from the answers.
 */
export function goToNextStep(values: I90Values, current: I90StepId): void {
	const next = nextVisibleStepId(values, current)
	if (next) {
		router.push(routeForStep(next))
	}
}
