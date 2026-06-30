/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applicants from "../applicants.js";
import type * as auth from "../auth.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_profileShape from "../lib/profileShape.js";
import type * as lib_validators from "../lib/validators.js";
import type * as model_applicants from "../model/applicants.js";
import type * as todos from "../todos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  applicants: typeof applicants;
  auth: typeof auth;
  documents: typeof documents;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/profileShape": typeof lib_profileShape;
  "lib/validators": typeof lib_validators;
  "model/applicants": typeof model_applicants;
  todos: typeof todos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
