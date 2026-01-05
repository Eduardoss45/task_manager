# 📌 Task Manager – Sistema de Gestão de Tarefas Colaborativo

Este projeto implementa um **Sistema de Gestão de Tarefas Colaborativo** baseado em **arquitetura de microserviços**, com comunicação assíncrona via **RabbitMQ** e **notificações em tempo real** utilizando **WebSocket**.

O foco principal foi entregar uma solução **end-to-end funcional**, com **separação clara de responsabilidades**, segurança básica aplicada e infraestrutura totalmente containerizada.

---

## ⚠️ Disclaimer Importante – Variáveis de Ambiente (`.env`)

> **⚠️ Atenção:**
> O correto funcionamento do sistema **depende obrigatoriamente** da configuração adequada dos arquivos `.env` em **todos os serviços** do projeto.

Antes de executar o sistema localmente, é obrigatório:

1. **Criar os arquivos `.env`** a partir dos modelos fornecidos (`.env.example`).
2. **Garantir que todas as variáveis obrigatórias estejam devidamente preenchidas**.
3. **Configurar corretamente os seguintes itens**:

   * **Credenciais de banco de dados** (host, porta, usuário, senha e nome do banco).
   * **URLs internas de comunicação entre os serviços**.
   * **Chaves JWT** utilizadas pelo `api-gateway` e pelo `auth-service`

     > As chaves **DEVEM SER IDÊNTICAS** para garantir a validação correta dos tokens.
   * **Configuração do RabbitMQ** (host, porta, usuário, senha e vhost, se aplicável).
   * **Configuração do WebSocket** (URL, porta e demais parâmetros necessários).

> A ausência ou configuração incorreta de variáveis de ambiente pode causar **falhas silenciosas**, erros de autenticação, falha na comunicação entre serviços ou falha total da aplicação.

---

## 🧱 Visão Geral da Arquitetura

```bash
Frontend (React + TanStack Router + TanStack Query)
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

> O **notifications-service** não resolve identidade de usuários.
> Ele utiliza exclusivamente os UUIDs presentes nos payloads dos eventos publicados pelos serviços produtores.
> O serviço mantém sua **própria base de dados**, sem acoplamento com o domínio de tasks.

---

## 🎨 Frontend

### Stack

* **React (Vite)**
* **TanStack Router**
* **TanStack Query**
* **Tailwind CSS**
* **shadcn/ui**
* **react-hook-form + zod**

---

## ⚛️ Gerenciamento de Estado & Cache (TanStack Query)

O frontend utiliza **TanStack Query** como solução principal para **fetching, cache e sincronização de dados assíncronos**.

### Responsabilidades

* Cache inteligente de dados vindos da API
* Revalidação automática de dados (`invalidateQueries`)
* Controle de estados:

  * `loading`
  * `error`
  * `success`
* Sincronização entre mutações e queries
* Redução de estado global manual

### Casos de Uso no Projeto

* Listagem de tarefas
* Detalhe de tarefa
* Comentários paginados
* Atualização automática após:

  * edição de tarefas
  * criação de comentários
* Integração com notificações via WebSocket (invalidação seletiva de queries)

> O TanStack Query foi adotado para **evitar estado duplicado**, melhorar a consistência visual da aplicação e reduzir complexidade no frontend.

---

### Características do Frontend

* Skeleton loaders
* WebSocket conectado após login
* Feedback visual via toast
* Atualização otimista e invalidação de cache controlada

### Páginas Implementadas

* Login
* Registro
* Troca de senha
* Lista de tarefas (filtro + busca + criação de tarefas)
* Detalhe da tarefa (comentários + status + histórico + editor)

---

## 📚 Documentação da API (Swagger)

A aplicação disponibiliza **documentação interativa da API** utilizando **Swagger (OpenAPI)**, centralizada no **API Gateway**, que é o ponto único de entrada do sistema.

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

---

## 🧪 Logs (Winston)

A aplicação utiliza **Winston** como logger padronizado, integrado ao **Logger do NestJS**, com o objetivo de substituir o uso de `console.log` e garantir logs estruturados e consistentes entre os serviços.

* Logger centralizado por serviço
* Logs formatados via configuração compartilhada (`winston.config`)
* Níveis suportados:

  * `info`
  * `warn`
  * `error`
  * `debug`
  * `verbose`

### Uso

* Logs de inicialização
* Eventos relevantes de execução
* Erros e exceções capturados pelo NestJS
* Logs consistentes em ambiente local e Docker

> O sistema de logs é tratado como um **diferencial técnico**, mantendo-se simples e sem acoplamento com ferramentas externas de observabilidade.
> A utilização do Winston permite **evoluir futuramente** para soluções de **observabilidade mais completas**, caso necessário, sem impactar a arquitetura atual.

---

## 🧪 Testes

* Testes unitários com **Jest**
* Cobertura aplicada em:

  * auth-service
  * tasks-service
  * notifications-service

---

## 🩺 Health Checks

| Endpoint               | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `/api/health/live`     | Verifica se o API Gateway está ativo         |
| `/api/health/services` | Verifica conectividade com serviços internos |

### Testes manuais

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
* Health checks usados apenas para **observabilidade e diagnóstico**

---

## 🗄️ Banco de Dados & Migrations

* TypeORM com **migrations explícitas**
* `synchronize: false` em todos os serviços
* Bancos separados por domínio

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
* Logs estruturados desde o início
* Eventos emitidos de forma ampla e filtrados no consumer
* Cache e sincronização de estado delegados ao **TanStack Query**

---

## ⚠️ Trade-offs & Observações

* Rate limit difícil de testar manualmente
* UI focada em funcionalidade
* Observabilidade avançada deixada como evolução natural

> A arquitetura está preparada para escalar e evoluir sem refatorações estruturais.

---

## 🚀 Melhorias Futuras

* Validação de env com Joi
* Redis para cache
* Retry + DLQ no RabbitMQ
* Notificações de tarefas vencidas
* Testes E2E
* Centralização de logs (ELK / Loki)

---

## ⏱️ Tempo de Desenvolvimento

* Backend: **4 dias**
* Frontend: **3 dias**
* Infraestrutura & ajustes: **3 dias**
