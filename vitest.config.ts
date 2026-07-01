import { defineConfig } from 'vitest/config'

// Convex functions are tested with `convex-test` running in the edge-runtime VM,
// per convex/_generated/ai/guidelines.md. Pure `src/` logic (e.g. the pdf-lib
// I-765 render) is also unit-tested here; those files opt into the Node
// environment with a `// @vitest-environment node` docblock. Full React Native
// component tests (if added later) still need a separate jest-expo project.
export default defineConfig({
	test: {
		environment: 'edge-runtime',
		include: ['convex/**/*.test.ts', 'src/**/*.test.ts'],
		server: {
			deps: {
				// convex-test must be transformed/inlined to run inside edge-runtime.
				inline: ['convex-test'],
			},
		},
	},
})
