// Public surface of the applicants module — routes and sibling modules import
// only from here (the filing Interview consumes the create/update hooks).
export { ApplicantsScreen } from './screen'
export { ApplicantProfileScreen } from './profile-screen'
export {
	useApplicants,
	useApplicant,
	useCreateApplicant,
	useUpdateApplicantProfile,
} from './data'
export type { Applicant, ApplicantProfile, Relationship } from './data'
