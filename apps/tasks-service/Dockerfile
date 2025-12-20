# builder
FROM node:20.11.1 AS builder
WORKDIR /app

# copiar root do monorepo
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./

# instalar todas as dependências
RUN npm install --include=dev
RUN npm install -g @nestjs/cli

# copiar apenas o serviço
COPY apps/tasks-service ./apps/tasks-service
WORKDIR /app/apps/tasks-service

# build do NestJS
RUN npm run build

# runtime
FROM node:20.11.1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copiar dist e node_modules do serviço correto
COPY --from=builder /app/apps/tasks-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/tasks-service/.env ./

CMD ["node", "dist/src/main.js"]