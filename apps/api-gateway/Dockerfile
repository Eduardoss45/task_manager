# builder
FROM node:20.11.1 AS builder
WORKDIR /app

# copiar arquivos do root do monorepo
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./
RUN npm install
RUN npm install -g @nestjs/cli

# copiar código da app
COPY apps/api-gateway ./apps/api-gateway
WORKDIR /app/apps/api-gateway

# build
RUN npm run build

# runtime
FROM node:20.11.1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copiar node_modules e dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/.env ./

EXPOSE 3000
CMD ["node", "dist/main"]
