// Public surface of the profile subflow — the applicants module root re-exports
// the detail screen and the profile-update hook (consumed by the filing Interview).
export { ApplicantProfileScreen } from './profile.screen'
export { useUpdateApplicantProfile } from './profile.data'
