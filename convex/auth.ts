import { expo } from '@better-auth/expo'
import { createClient, type GenericCtx } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { requireRunMutationCtx } from '@convex-dev/better-auth/utils'
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal'
import { anonymous } from 'better-auth/plugins'
import { components, internal } from './_generated/api'
import { DataModel } from './_generated/dataModel'
import { query } from './_generated/server'
import authConfig from './auth.config'

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	// Social providers are enabled only when their OAuth credentials are present
	// in the Convex deployment env (set via `npx convex env set`). Until then the
	// SocialAuthButtons on the auth screen surface a "provider not configured"
	// error; email/password works without any of this.
	// Convex exposes deployment env vars on `process.env` at runtime, but the
	// convex/ tsconfig ships no Node typings — read through globalThis to stay
	// typed without pulling in @types/node.
	const env =
		(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

	const socialProviders: NonNullable<BetterAuthOptions['socialProviders']> = {}
	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		socialProviders.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}
	}
	if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
		socialProviders.github = {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		}
	}

	return betterAuth({
		// Must match the app scheme in app.json (used for deep-link auth callbacks).
		trustedOrigins: ['immigrationrenewalhelp://'],
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders,
		plugins: [
			expo(),
			// Anonymous-first onboarding (ADR-0009): the Welcome screen's "Start
			// filing" action calls `authClient.signIn.anonymous()`, creating a
			// throwaway anonymous identity so a person can invest effort before
			// hitting any signup wall. The `@convex-dev/better-auth` component
			// schema already carries the `isAnonymous` user field, so the plugin
			// works against this deployment without a schema change.
			anonymous({
				// Anonymous → credentialed data preservation (ADR-0009). On this
				// `@convex-dev/better-auth` version the anonymous plugin creates a
				// BRAND-NEW credentialed user on link and then deletes the anonymous
				// user, so the Convex `tokenIdentifier` (`${issuer}|${userId}`) — and
				// therefore our `ownerId` (convex/lib/auth.ts) — CHANGES across the
				// upgrade. Re-own the anonymous user's applicants/documents onto the
				// new account so nothing created anonymously is lost. See
				// convex/account.ts for the full research write-up.
				//
				// `ctx` is the Convex context captured by `createAuth`; during the
				// auth HTTP request that triggers linking it is an action ctx, so
				// `requireRunMutationCtx` exposes `runMutation`.
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					await requireRunMutationCtx(ctx).runMutation(internal.account.migrateAnonymousOwner, {
						anonymousUserId: anonymousUser.user.id,
						newUserId: newUser.user.id,
					})
				},
			}),
			convex({ authConfig }),
		],
	})
}

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx)
	},
})
