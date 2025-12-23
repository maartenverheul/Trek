# syntax=docker/dockerfile:1

# Base image with common packages
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies using lockfile for reproducible builds
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built assets and public files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Optional: copy knex config and migrations if you want to run them inside the container
COPY --from=builder /app/knexfile.js ./knexfile.js
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds

# Use non-root user for security
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
