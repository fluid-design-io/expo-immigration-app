# Container for the API service (apps/server). Self-contained so the Railway
# build stays tiny — only the server + Hono, not the RN/Expo workspace.
FROM oven/bun:1
WORKDIR /app
COPY apps/server/package.json ./
RUN bun install
COPY apps/server/src ./src
ENV NODE_ENV=production
CMD ["bun", "src/index.ts"]
