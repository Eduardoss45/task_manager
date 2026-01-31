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
COPY apps/tasks-service/package.json apps/tasks-service/

RUN npm install

# =========================
# DEPS DIMENSIONADO (tasks-service)
# =========================
FROM deps AS tasks-service-deps

RUN npm prune --workspace=@task_manager/tasks-service --omit=optional=false

# =========================
# BUILD
# =========================
FROM base AS builder

COPY --from=tasks-service-deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@task_manager/tasks-service

# =========================
# RUNTIME
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=tasks-service-deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/tasks-service/dist ./dist
COPY apps/tasks-service/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/src/main.js"]