# Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Runtime
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5173
CMD ["npx", "vite", "preview", "--port", "5173", "--host"]
