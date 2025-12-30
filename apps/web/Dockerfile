# =========================
# BUILD
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# Recebe o valor da URL da API durante o build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instala dependências do monorepo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm install

# Copia código
COPY . .

# Build do frontend (o VITE_API_URL já estará disponível em import.meta.env)
RUN npm run build --workspace=@task_manager/web

# =========================
# RUNTIME
# =========================
FROM nginx:alpine

# Remove config default
RUN rm /etc/nginx/conf.d/default.conf

# Config Nginx SPA
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copia build final
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
