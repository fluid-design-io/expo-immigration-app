// Single client-side entry point to the Convex backend. Re-exporting `api` and
// the generated `Doc`/`Id` types here keeps deep relative paths out of feature
// code and lets the client infer types from the server schema (server-driven
// types) instead of redeclaring them.
export { api } from '../../convex/_generated/api'
export type { Doc, Id } from '../../convex/_generated/dataModel'
