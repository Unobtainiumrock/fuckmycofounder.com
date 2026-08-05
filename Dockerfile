FROM node:24.18.0-alpine AS dependencies
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24.18.0-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG BUILD_ID=local
ENV NEXT_TELEMETRY_DISABLED=1
RUN case "$BUILD_ID" in ""|*[!A-Za-z0-9._-]*) exit 1 ;; esac \
    && [ "${#BUILD_ID}" -le 128 ] \
    && printf 'export const artifactBuildId = "%s";\n' "$BUILD_ID" > src/platform/runtime/artifact-build-id.ts \
    && pnpm build

FROM node:24.18.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV APP_ENV=preview
ENV REQUIRE_DATABASE=false
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/scripts/runtime/start-standalone.mts ./start-standalone.mts
USER node
EXPOSE 3000
STOPSIGNAL SIGTERM
CMD ["node", "start-standalone.mts"]
