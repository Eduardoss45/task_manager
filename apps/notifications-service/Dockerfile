# ========================
# Builder
# ========================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./

COPY packages ./packages
COPY apps ./apps

RUN npm install
RUN npm run build --if-present --workspaces

# ========================
# Runtime
# ========================
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/notifications-service/dist ./dist

CMD ["node", "dist/main.js"]
