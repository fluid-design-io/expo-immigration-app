import { Hono } from "hono";

// Minimal API bootstrap so Railway has a real service to build + run.
// Kept self-contained (no workspace imports) so the container build stays tiny —
// just the server + Hono, not the whole RN/Expo workspace. The full
// Hono + Drizzle + Better Auth API (and shared types) come in the backend phase.

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

const app = new Hono();

const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });

app.get("/", (c) => c.json(ok({ service: "immigration-api", status: "ok" })));
app.get("/health", (c) => c.json(ok({ status: "ok" })));

const port = Number(process.env.PORT) || 3000;

// Bun serves a default export with { port, fetch }.
export default { port, fetch: app.fetch };
