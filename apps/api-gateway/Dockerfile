# =========================
# BASE
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# =========================
# DEPS
# =========================
FROM base AS deps

# Copiamos apenas manifests para cache eficiente
COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json apps/api-gateway/

RUN npm install

# =========================
# BUILD
# =========================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build somente o serviço
RUN npm run build --workspace=@task_manager/api-gateway

# =========================
# RUNTIME
# =========================
FROM base AS runner

# Segurança básica
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main.js"]
