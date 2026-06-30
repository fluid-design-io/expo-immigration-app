import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
	applicantProfileValidator,
	documentTypeValidator,
	relationshipValidator,
} from './lib/validators'

// The Better Auth component manages its own tables in an isolated component
// namespace, so no auth tables are needed here. Application tables below are
// scoped to an account holder via `ownerId` (the authenticated identity's
// tokenIdentifier — see convex/lib/auth.ts).
export default defineSchema({
	todos: defineTable({
		title: v.string(),
		description: v.string(),
		completed: v.boolean(),
	}),

	// An Applicant is the person whose benefit is renewed/replaced. One account
	// holder may own several applicants (self + dependents) — see ADR-0009.
	applicants: defineTable({
		ownerId: v.string(),
		displayName: v.string(),
		relationship: relationshipValidator,
		profile: v.optional(applicantProfileValidator),
	}).index('by_ownerId', ['ownerId']),

	// A Document is one stored item in an applicant's vault. Each upload of a
	// given type is a new version; the latest version is the "current" one
	// (see ADR-0007). `ownerId` is denormalised from the applicant for scoping.
	documents: defineTable({
		applicantId: v.id('applicants'),
		ownerId: v.string(),
		type: documentTypeValidator,
		version: v.number(),
		expiryDate: v.optional(v.string()),
		storageId: v.optional(v.id('_storage')),
	})
		.index('by_applicantId', ['applicantId'])
		.index('by_applicantId_and_type', ['applicantId', 'type']),
})
