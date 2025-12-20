# builder
FROM node:20.11.1 AS builder
WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY apps/auth-service ./apps/auth-service
WORKDIR /app/apps/auth-service

RUN npm run build

# runtime
FROM node:20.11.1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/.env ./

# serviço de mensageria (não expõe porta)
CMD ["node", "dist/src/main.js"]