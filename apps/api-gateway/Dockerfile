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
COPY apps/api-gateway/package.json apps/api-gateway/

# Instala todas as dependências (dev + prod) do monorepo
RUN npm install

# =========================
# DEPS DIMENSIONADO (somente api-gateway)
# =========================
FROM deps AS api-gateway-deps

RUN npm prune --workspace=@task_manager/api-gateway --omit=optional=false

# =========================
# BUILD
# =========================
FROM base AS builder

# Dependências nativas para sharp
RUN apk add --no-cache python3 make g++ libc6-compat vips-dev vips-tools

COPY --from=api-gateway-deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@task_manager/api-gateway

# =========================
# RUNTIME
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

# usuário com UID/GID FIXOS
RUN addgroup -g 101 app \
    && adduser -D -u 100 -G app app

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=api-gateway-deps /app/node_modules ./node_modules
COPY apps/api-gateway/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main.js"]