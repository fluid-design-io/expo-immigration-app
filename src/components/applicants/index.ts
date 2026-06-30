// Public surface of the applicants module — routes and sibling modules import
// only from here (the filing Interview consumes the create/update hooks).
export { ApplicantsScreen } from './applicants.screen'
export { useApplicants, useCreateApplicant } from './applicants.data'
export { ApplicantProfileScreen, useUpdateApplicantProfile } from './profile'
export type { Applicant, ApplicantProfile } from './applicants.types'
