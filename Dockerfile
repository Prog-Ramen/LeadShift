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

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------------------------------------------------------
# Production runtime
# ---------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run the application as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# output: "standalone" generates this reduced runtime package.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/static \
    ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
