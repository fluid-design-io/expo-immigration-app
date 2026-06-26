// @immigration/shared — types shared between the mobile app (apps/mobile) and the
// server (apps/server). Plain TS for now; Zod validation schemas get added here at
// the backend phase so client and server validate against one source of truth.

/** Standard API response envelope — see docs/ARCHITECTURE.md. */
export type ApiResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

/** Paginated envelope for list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Filing lifecycle status (mirrors applications.status in docs/DATA-MODEL.md). */
export type ApplicationStatus =
  | "draft"
  | "ready"
  | "submitted"
  | "accepted"
  | "rfe"
  | "approved"
  | "denied"
  | "withdrawn";

/** v1 supported filing types. I-90 is deferred (see docs/DECISIONS.md, D2). */
export type ApplicationTypeCode = "I-765";

/** Deadline kinds that drive the calendar + reminder pipeline. */
export type DeadlineKind =
  | "file_by"
  | "expiry"
  | "biometrics"
  | "rfe_response"
  | "interview"
  | "custom";
