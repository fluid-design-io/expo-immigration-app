import { type Doc } from '@/lib/api'

/** An applicant document, typed from the Convex schema (server-driven types). */
export type Applicant = Doc<'applicants'>
export type Relationship = Applicant['relationship']
export type ApplicantProfile = NonNullable<Applicant['profile']>
