#syntax=docker/dockerfile:1.4
FROM node:18-alpine AS base

# DEPS
FROM base AS deps
WORKDIR /app

COPY --link .npmrc package.json package-lock.json ./

RUN npm ci

# BUILDER
FROM base AS builder
WORKDIR /app

# copy files
COPY --from=deps --link /app/node_modules ./node_modules
COPY --link  . .

# build
RUN npm run build

# RUNNER
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN \
  addgroup --system --gid 1001 nodejs; \
  adduser --system --uid 1001 nodejs

COPY --link package.json ./
COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=builder --link --chown=1001:1001 /app/dist ./dist

USER nodejs

EXPOSE 3000

ENV PORT 3000
ENV REALTIME_DATA_DIR /var/lib/realtime

CMD ["node", "dist/index.js"]