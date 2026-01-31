# =========================
# BASE
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# =========================
# DEPS (monorepo completo)
# =========================
FROM base AS deps

COPY package.json package-lock.json ./
COPY apps/notifications-service/package.json apps/notifications-service/

RUN npm install

# =========================
# DEPS DIMENSIONADO (notifications-service)
# =========================
FROM deps AS notifications-service-deps

RUN npm prune --workspace=@task_manager/notifications-service --omit=optional=false

# =========================
# BUILD
# =========================
FROM base AS builder

COPY --from=notifications-service-deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@task_manager/notifications-service

# =========================
# RUNTIME
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=notifications-service-deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/notifications-service/dist ./dist
COPY apps/notifications-service/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/src/main.js"]