<<<<<<< Updated upstream
# syntax=docker/dockerfile:1

# ---------------------------------------------------------
# Base image
# ---------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Helps some Node packages run correctly on Alpine Linux.
RUN apk add --no-cache libc6-compat


# ---------------------------------------------------------
# Install dependencies
# ---------------------------------------------------------
FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci


# ---------------------------------------------------------
# Build the Next.js application
# ---------------------------------------------------------
FROM base AS builder

=======
# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder
>>>>>>> Stashed changes
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------------------------------------------------------
# Production runtime
# ---------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app
<<<<<<< Updated upstream

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run the application as a non-root user.
=======
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

>>>>>>> Stashed changes
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
<<<<<<< Updated upstream

# output: "standalone" generates this reduced runtime package.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/static \
    ./.next/static

USER nextjs

EXPOSE 3000
=======
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
>>>>>>> Stashed changes

CMD ["node", "server.js"]
