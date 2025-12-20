# 📌 Task Manager – Sistema de Gestão de Tarefas Colaborativo

Este projeto implementa um **Sistema de Gestão de Tarefas Colaborativo** baseado em **arquitetura de microserviços**, com comunicação assíncrona via **RabbitMQ** e **notificações em tempo real** utilizando **WebSocket**.

O foco principal foi entregar uma solução **end-to-end funcional**, com **separação clara de responsabilidades**, segurança básica aplicada e infraestrutura totalmente containerizada.

---

## 🧱 Visão Geral da Arquitetura

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

### Tecnologias Principais

* **Monorepo** gerenciado com **Turborepo**
* **PostgreSQL** como banco de dados
* **RabbitMQ** para comunicação entre serviços
* **Docker + Docker Compose** para orquestração
* **TypeORM + Migrations** para controle de schema

---

## 🔐 Segurança & Autenticação

* Hash de senha com **bcrypt**
* Autenticação via **JWT**
* `accessToken` e `refreshToken`
* Tokens armazenados em **cookies HTTP-only**
* Proteção de rotas com **Guards + Passport**
* **Rate limit** aplicado no API Gateway (`10 req/s`)
* Payload do JWT minimizado (sem dados sensíveis)

> O **auth-service** é responsável exclusivamente por autenticação e emissão de tokens.
> O **API Gateway** apenas valida tokens já emitidos, mantendo separação clara de responsabilidades.

---

## 📋 Domínio de Tasks

### Funcionalidades

* CRUD completo de tarefas
* Comentários por tarefa
* Histórico básico de alterações

### Status disponíveis

* `TODO`
* `IN_PROGRESS`
* `REVIEW`
* `DONE`

### Prioridades disponíveis

* `LOW`
* `MEDIUM`
* `HIGH`
* `URGENT`

### Eventos publicados

* `task.created`
* `task.updated`
* `task.comment.created`

---

## 🔔 Notificações em Tempo Real

* Eventos consumidos via **RabbitMQ**
* Persistência em banco próprio
* Envio via **WebSocket**
* Frontend recebe notificações em tempo real

> O notifications-service **não resolve identidade de usuários**.
> Ele utiliza exclusivamente os UUIDs presentes nos payloads dos eventos publicados pelos serviços produtores.
> O notifications-service mantém sua própria base de dados, utilizada exclusivamente para persistência e entrega de notificações, sem acoplamento com o domínio de tasks.

---

## 🎨 Frontend

### Stack

* **React (Vite)**
* **TanStack Router**
* **Tailwind CSS**
* **shadcn/ui**
* **react-hook-form + zod**

### Características

* Skeleton loaders
* WebSocket conectado após login
* Feedback visual via toast

### Páginas Implementadas

* Login
* Register
* Lista de tarefas (filtro + busca)
* Detalhe da tarefa (comentários + status)

---

## 📚 Documentação da API (Swagger)

O projeto disponibiliza **documentação interativa da API** utilizando **Swagger (OpenAPI)**, centralizada no **API Gateway**, que é o ponto único de entrada do sistema.

### Endpoints disponíveis

| Endpoint         | Descrição                          |
| ---------------- | ---------------------------------- |
| `/api/docs`      | Interface interativa do Swagger UI |
| `/api/docs-json` | Documento OpenAPI em formato JSON  |

### Conteúdo documentado

* Endpoints expostos pelo **API Gateway**
* Rotas protegidas por **JWT**
* DTOs de entrada e saída
* Códigos de resposta (`200`, `201`, `400`, `401`, `404`, etc.)
* Exemplos de payload

> Os **microserviços internos não expõem Swagger individualmente**, reforçando o papel do **API Gateway como camada de contrato público** da aplicação.

### Autenticação no Swagger

* Autenticação baseada em **JWT**
* Token informado via **Authorize**
* Rotas protegidas acessíveis para testes manuais

### Benefícios

* Testes manuais sem frontend
* Contrato de integração da API
* Centralização da documentação
* Exportável para:

  * Postman
  * Insomnia
  * Testes E2E
  * Integrações futuras

### Decisão Arquitetural

A documentação foi mantida **exclusivamente no API Gateway** para:

* Evitar duplicação de contratos
* Manter separação entre **API pública** e **serviços internos**
* Garantir estabilidade para consumidores externos

---

## 🧪 Observabilidade & Qualidade

* Logging estruturado
* Testes unitários com **Jest**:

  * auth-service
  * tasks-service
  * notifications-service

### Health Checks

| Endpoint               | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `/api/health/live`     | Verifica se o API Gateway está ativo         |
| `/api/health/services` | Verifica conectividade com serviços internos |

#### Testes manuais

```bash
curl http://localhost:3000/api/health/live
curl http://localhost:3000/api/health/services
```

---

## 🐳 Infraestrutura & Docker

* Dockerfile individual por serviço
* docker-compose orquestrando:

  * API Gateway
  * Auth Service
  * Tasks Service
  * Notifications Service
  * PostgreSQL
  * RabbitMQ

### Execução com Docker

```bash
docker compose up --build
```

### Observação sobre Health Checks

* O frontend **não depende** de health checks para iniciar
* Utilizado `condition: service_started`
* Health checks usados para **observabilidade e diagnóstico**, não como dependência rígida

---

## 🗄️ Banco de Dados & Migrations

* TypeORM com **migrations explícitas**
* `synchronize: false` em todos os serviços
* Bancos separados:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE tasks_db;
CREATE DATABASE notifications_db;
```

### Execução de Migrations

* Executadas automaticamente no Docker
* Uso exclusivo de `migration:run`
* `migration:generate` nunca é usado em ambiente Docker

---

## ▶️ Execução Local (sem Docker)

```bash
npm install
npm run migrate:init
npm run test
npm run build
npm run dev
```

### O que cada comando faz

* `npm install` – instala dependências
* `npm run migrate:init` – executa migrations iniciais
* `npm run test` – executa testes unitários
* `npm run build` – build completo via Turborepo
* `npm run dev` – inicia todos os serviços em modo dev

### Pré-requisitos

* Node.js **>= 18**
* PostgreSQL em execução
* RabbitMQ em execução
* Variáveis de ambiente configuradas (`.env`)

---

## 🧠 Decisões Técnicas Importantes

* Monorepo para padronização
* API Gateway como ponto único de entrada
* RabbitMQ para desacoplamento
* WebSocket fora do fluxo HTTP
* Relacionamentos entre serviços via **UUID**
* Eventos emitidos de forma ampla e filtrados no consumer

---

## ⚠️ Trade-offs & Observações

* Rate limit (`ttl: 1000, limit: 10`) difícil de testar manualmente
* UI focada em funcionalidade
* Alguns pontos tratados como diferenciais por limitação de tempo

> A arquitetura está preparada para evolução sem refatorações estruturais.

---

## 🚀 Melhorias Futuras

* TanStack Query
* Validação de env com Joi
* Redis para cache
* Retry + DLQ no RabbitMQ
* Notificações de tarefas vencidas
* Testes E2E
* Observabilidade avançada

---

## ⏱️ Tempo de Desenvolvimento

* Backend: **4 dias**
* Frontend: **3 dias**
* Infraestrutura & ajustes: **3 dias**
