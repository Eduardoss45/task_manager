# =========================
# Builder
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar arquivos de configuração e código
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages

# Instalar dependências
RUN npm install

# Build do NestJS
RUN npm run build --if-present --workspaces

# =========================
# Runtime
# =========================
FROM node:20-alpine
WORKDIR /app

# Copiar node_modules e build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./dist

# Copiar .env do app
COPY apps/api-gateway/.env ./

EXPOSE 3000

# Comando para rodar o NestJS
CMD ["node", "dist/main.js"]