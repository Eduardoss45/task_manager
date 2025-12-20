# builder
FROM node:22.12.0 AS builder
WORKDIR /app

# copiar root do monorepo
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./
RUN npm install --include=dev

# copiar todo o código
COPY . .

# build apenas a app web
WORKDIR /app/apps/web

RUN rm -f package-lock.json && npm install --include=dev

RUN npm run build

# runtime
FROM node:22.12.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/.env ./

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
