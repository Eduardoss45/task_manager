# ✅ Checklist: Desafio Full-stack Júnior — Sistema de Gestão de Tarefas Colaborativo

## 1️⃣ Estrutura do Monorepo

- [x] Diretórios principais (`apps/`, `packages/`) criados
- [x] `apps/web/` configurado com React + TanStack Router + shadcn/ui + Tailwind
- [ ] `apps/api-gateway/` configurado com Nest.js (HTTP + WebSocket + Swagger)
- [ ] `apps/auth-service/` configurado como microserviço Nest.js
- [ ] `apps/tasks-service/` configurado como microserviço Nest.js com RabbitMQ
- [ ] `apps/notifications-service/` configurado com Nest.js, RabbitMQ + WebSocket
- [ ] `packages/` com types, utils, tsconfig, eslint-config

---

## 2️⃣ Front-end (React)

- [ ] Páginas obrigatórias:
  - [ ] Login/Register com validação (modal opcional)
  - [ ] Lista de tarefas com filtros e busca
  - [ ] Detalhe da tarefa com comentários

- [ ] Estado: Context API ou Zustand para autenticação
- [ ] WebSocket conectado para notificações em tempo real
- [ ] Formulários com `react-hook-form` + `zod`
- [ ] Skeleton loaders / shimmer effect implementados
- [ ] Toast notifications implementadas
- [ ] Diferencial (opcional): TanStack Query integrado

---

## 3️⃣ Back-end (Nest.js)

### Autenticação & Gateway

- [ ] JWT implementado (accessToken 15 min, refreshToken 7 dias)
- [ ] Hash de senha com bcrypt ou argon2
- [ ] Guards e estratégias Passport para rotas protegidas
- [ ] Endpoints disponíveis:
  - [ ] POST `/api/auth/register`
  - [ ] POST `/api/auth/login`
  - [ ] POST `/api/auth/refresh`

- [ ] Swagger/OpenAPI exposto (`/api/docs`)
- [ ] Rate limiting (10 req/seg) implementado no API Gateway

### Tasks Service

- [ ] CRUD de tarefas completo (título, descrição, prazo, prioridade, status)
- [ ] Atribuição a múltiplos usuários
- [ ] Comentários: criar e listar
- [ ] Histórico de alterações (audit log simplificado)
- [ ] Eventos publicados via RabbitMQ:
  - [ ] `task.created`
  - [ ] `task.updated`
  - [ ] `task.comment.created`

### Notifications Service

- [ ] Consome eventos do RabbitMQ
- [ ] Persiste notificações no banco
- [ ] Entrega notificações via WebSocket
- [ ] Eventos emitidos para o front:
  - [ ] `task:created`
  - [ ] `task:updated`
  - [ ] `comment:new`

---

## 4️⃣ Banco de Dados (PostgreSQL)

- [ ] Container PostgreSQL rodando via Docker Compose
- [ ] Microsserviços conectados ao host `db` e porta `5432`
- [ ] Usuário, senha e database configurados conforme docker-compose
- [ ] TypeORM configurado com entidades correspondentes (`User`, `Task`, `Comment`, `Notification`)
- [ ] Migrations configuradas e funcionando

---

## 5️⃣ RabbitMQ

- [ ] Container RabbitMQ rodando via Docker Compose
- [ ] Todos os microsserviços conectados ao broker (`5672`)
- [ ] Fila padrão configurada para eventos de tarefas e notificações

---

## 6️⃣ Docker & DevX

- [ ] Todos os serviços subindo via Docker Compose:
  - [ ] Web
  - [ ] API Gateway
  - [ ] Auth Service
  - [ ] Tasks Service
  - [ ] Notifications Service
  - [ ] PostgreSQL
  - [ ] RabbitMQ

- [ ] Volumes e redes configuradas (`challenge-network`)
- [ ] Variáveis de ambiente configuradas corretamente (`.env`)

---

## 7️⃣ Documentação

- [ ] README com:
  - [ ] Arquitetura (diagrama ASCII ou imagem)
  - [ ] Decisões técnicas e trade-offs
  - [ ] Problemas conhecidos e melhorias futuras
  - [ ] Tempo gasto em cada parte
  - [ ] Instruções específicas de setup

---

Se você quiser, posso criar uma **versão em Markdown com caixas de seleção interativas** pronta para você ir marcando direto no VS Code ou GitHub, já formatada para tickar enquanto faz o checklist.

Quer que eu faça isso?
