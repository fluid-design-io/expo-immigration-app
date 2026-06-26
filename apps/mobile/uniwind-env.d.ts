/// <reference types="uniwind/types" />

// CSS side-effect imports (e.g. `import "../global.css"`). Uniwind generates a
// richer declaration into uniwind-types.d.ts on `expo start`; this keeps `tsc`
// green before the first run. Duplicate wildcard module decls merge harmlessly.
declare module "*.css";
