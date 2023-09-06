#syntax=docker/dockerfile:1.4
FROM node:18.17.1-alpine AS base

# DEPS
FROM base AS deps
WORKDIR /app

COPY --link package.json package-lock.json ./

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

COPY --link package.json ./
COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=builder --link /app/dist ./dist

ENV PORT 8080
ENV REALTIME_DATA_DIR /var/lib/realtime

EXPOSE 8080

CMD ["node", "dist/index.js"]