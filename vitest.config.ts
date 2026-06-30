import { defineConfig } from 'vitest/config'

// Convex functions are tested with `convex-test` running in the edge-runtime VM,
// per convex/_generated/ai/guidelines.md. Only backend tests live here; React
// Native component tests (if added later) need a separate jest-expo project.
export default defineConfig({
	test: {
		environment: 'edge-runtime',
		include: ['convex/**/*.test.ts'],
		server: {
			deps: {
				// convex-test must be transformed/inlined to run inside edge-runtime.
				inline: ['convex-test'],
			},
		},
	},
})
