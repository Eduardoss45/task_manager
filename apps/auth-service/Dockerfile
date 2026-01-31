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
COPY apps/auth-service/package.json apps/auth-service/

RUN npm install

# =========================
# DEPS DIMENSIONADO (auth-service)
# =========================
FROM deps AS auth-service-deps

RUN npm prune --workspace=@task_manager/auth-service --omit=optional=false

# =========================
# BUILD
# =========================
FROM base AS builder

COPY --from=auth-service-deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@task_manager/auth-service

# =========================
# RUNTIME
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=auth-service-deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY apps/auth-service/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/src/main.js"]