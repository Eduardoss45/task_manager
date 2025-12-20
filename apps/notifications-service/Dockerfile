# builder
FROM node:20.11.1 AS builder
WORKDIR /app

# copiar root do monorepo
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./

# instalar dependências do monorepo
RUN npm install --include=dev
RUN npm install -g @nestjs/cli

# copiar o serviço
COPY apps/notifications-service ./apps/notifications-service
WORKDIR /app/apps/notifications-service

# build do NestJS
RUN npm run build

# runtime
FROM node:20.11.1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copiar dist e node_modules específicos do serviço
COPY --from=builder /app/apps/notifications-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/notifications-service/.env ./

CMD ["node", "dist/src/main.js"]