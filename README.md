# 📌 Task Manager – Sistema de Gestão de Tarefas Colaborativo

Este projeto implementa um **Sistema de Gestão de Tarefas Colaborativo** baseado em **arquitetura de microserviços**, com comunicação assíncrona via **RabbitMQ** e **notificações em tempo real** utilizando **WebSocket**.

O foco principal foi entregar uma solução **end-to-end funcional**, com **separação clara de responsabilidades**, segurança básica aplicada e infraestrutura totalmente containerizada.

---

## 🧱 Arquitetura Geral

```bash
Frontend (React + TanStack Router)
        │
        ▼
API Gateway (NestJS)
        │
        ├── Auth Service
        │     └── Autenticação, JWT, Refresh Token
        │
        ├── Tasks Service
        │     └── Tarefas, Comentários, Eventos
        │
        └── Notifications Service
              └── Persistência + WebSocket
```

- **Monorepo** gerenciado com **Turborepo**
- **PostgreSQL** como banco de dados
- **RabbitMQ** para comunicação entre serviços
- **Docker + Docker Compose** para orquestração
- **TypeORM + Migrations** para controle de schema

---

## 🔐 Segurança & Autenticação

- Hash de senha com **bcrypt**
- Autenticação via **JWT**
- `accessToken` e `refreshToken`
- Tokens armazenados em **cookies HTTP-only**
- Proteção de rotas com **Guards + Passport**
- **Rate limit** aplicado no API Gateway (`10 req/s`)
- Payload do JWT minimizado (sem dados sensíveis)

> O **auth-service** é responsável exclusivamente por autenticação e emissão de tokens.
> O **API Gateway** apenas valida tokens já emitidos, mantendo separação clara de responsabilidades.

---

## 📋 Funcionalidades de Tasks

- CRUD completo de tarefas
- Status:
  - `TODO`
  - `IN_PROGRESS`
  - `REVIEW`
  - `DONE`

- Prioridade:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
  - `URGENT`

- Comentários por tarefa
- Histórico básico de alterações
- Publicação de eventos:
  - `task.created`
  - `task.updated`
  - `task.comment.created`

---

## 🔔 Notificações em Tempo Real

- Eventos consumidos via **RabbitMQ**
- Persistência em banco próprio
- Envio via **WebSocket**
- Frontend recebe notificações em tempo real

> O notifications-service **não resolve identidade de usuários**.
> Ele utiliza exclusivamente os UUIDs presentes nos payloads dos eventos publicados pelos serviços produtores.
> O notifications-service mantém sua própria base de dados, utilizada exclusivamente para persistência e entrega de notificações, sem acoplamento com o domínio de tasks.

---

## 🎨 Frontend

- **React (Vite)**
- **TanStack Router**
- **Tailwind CSS**
- **shadcn/ui**
- **react-hook-form + zod**
- Skeleton loaders
- WebSocket conectado após login
- Feedback visual via toast

### Páginas Implementadas

- Login
- Register
- Lista de tarefas (filtro + busca)
- Detalhe da tarefa (comentários + status)

---

## 🧪 Observabilidade & Qualidade

- Health checks:
  - `/api/health/live`
  - `/api/health/services`

- Logging estruturado
- Testes unitários com **Jest**:
  - auth-service
  - tasks-service
  - notifications-service

---

## 🧪 Health Checks & Testes Manuais

O sistema expõe endpoints de **health check** no **API Gateway**, permitindo verificar o estado da aplicação e a disponibilidade dos serviços internos de forma independente do frontend.

### Endpoints disponíveis

| Endpoint               | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `/api/health/live`     | Verifica se o API Gateway está ativo         |
| `/api/health/services` | Verifica conectividade com serviços internos |

---

### 🔍 Testar manualmente com `curl`

#### ✔️ Verificar se o API Gateway está ativo

```bash
curl http://localhost:3000/api/health/live
```

---

#### ✔️ Verificar status dos serviços internos

```bash
curl http://localhost:3000/api/health/services
```

Esse endpoint valida:

- Conectividade com os microserviços
- Comunicação via RabbitMQ
- Disponibilidade geral do ecossistema

---

### 🐳 Observação sobre Docker & Health Checks

O **frontend não depende de health checks** para inicialização.
Ele pode ser iniciado antes do API Gateway, pois o navegador lida naturalmente com reconexões quando a API ainda não está disponível.

Por esse motivo:

- O `docker-compose` **não utiliza `service_healthy` para o serviço web**
- É usado `condition: service_started` para evitar acoplamento desnecessário
- Os health checks existem para **observabilidade e diagnóstico**, não como dependência rígida de startup

---

### ✅ Benefícios dessa abordagem

- Testes rápidos sem frontend
- Diagnóstico fácil em ambientes Docker
- Separação clara entre **infra**, **API** e **UI**
- Health checks reutilizáveis para futuras integrações (K8s, CI, etc.)

---

## 🗄️ Banco de Dados & Migrations

- TypeORM com **migrations explícitas**
- `synchronize: false` em todos os serviços
- Bancos separados:

  ```sql
  CREATE DATABASE auth_db;
  CREATE DATABASE tasks_db;
  CREATE DATABASE notifications_db;
  ```

### Execução de Migrations

- As migrations são executadas automaticamente no Docker
- Apenas `migration:run` é utilizado
- Nunca é usado `migration:generate` em ambiente Docker

---

## 🐳 Docker & Infraestrutura

- Dockerfile individual por serviço
- docker-compose orquestrando:
  - API Gateway
  - Auth Service
  - Tasks Service
  - Notifications Service
  - PostgreSQL
  - RabbitMQ

### Executar o projeto

```bash
docker compose up --build
```

Perfeito 👍
Esse trecho está **correto**, mas dá para deixá-lo um pouco mais **claro e profissional**, explicando **o que cada comando faz** (isso costuma contar pontos em avaliação).

Segue uma versão **revisada e recomendada** para o README:

---

## ▶️ Execução Local (sem Docker)

Para executar o projeto localmente **sem Docker**, navegue até a raiz do monorepo e execute:

```bash
npm install
npm run migrate:init
npm run test
npm run build
npm run dev
```

### O que cada comando faz

- `npm install`
  Instala todas as dependências do monorepo.

- `npm run migrate:init`
  Executa as migrations iniciais dos serviços (`auth`, `tasks`, `notifications`).

- `npm run test`
  Executa os testes unitários configurados nos serviços.

- `npm run build`
  Realiza o build completo do monorepo utilizando **Turborepo**.

- `npm run dev`
  Inicia todos os serviços em modo desenvolvimento.

---

### ⚠️ Pré-requisitos

- Node.js **>= 18**
- PostgreSQL em execução
- RabbitMQ em execução
- Variáveis de ambiente configuradas (`.env`)

---

## 🧠 Decisões Técnicas Importantes

- Monorepo para padronização e reutilização
- API Gateway como ponto único de entrada
- RabbitMQ para desacoplamento
- WebSocket separado do fluxo HTTP
- Relacionamentos entre serviços feitos apenas por **UUIDs**
- Eventos emitidos de forma ampla e filtrados no consumer

---

## ⚠️ Trade-offs & Observações

- Rate limit com `ttl: 1000, limit: 10` é correto, porém difícil de testar manualmente
  → Para testes, pode ser ajustado temporariamente
- UI focada em funcionalidade, não em refinamento visual
- Alguns pontos foram tratados como **opcionais/diferenciais** por limitação de tempo

> A arquitetura já está preparada para suportar melhorias futuras sem refatorações estruturais.

---

## 🚀 Melhorias Futuras

- Integração com **TanStack Query**
- Validação de variáveis de ambiente com Joi
- Redis para cache
- Retry policy + DLQ no RabbitMQ
- Notificações automáticas para tarefas vencidas
- Testes E2E
- Observabilidade avançada

---

## ⏱️ Tempo de Desenvolvimento

- Backend: **4 dias**
- Frontend: **3 dias**
- Infraestrutura & ajustes: **3 dias**
