# Portal Corporativo Integrado ao TOTVS Datasul

## Visão geral

Este repositório contém a base inicial do Portal Corporativo para autenticação e integração com o TOTVS Datasul. A primeira versão foi projetada como uma plataforma corporativa moderna, com frontend Angular + PO UI e backend NestJS + TypeScript.

## Objetivo

- autenticar com credenciais do Datasul;
- não duplicar usuários ou senhas;
- separar frontend e backend;
- preparar uma arquitetura para futuras aplicações por área;
- expor dados de usuário e grupos após autenticação.

## Arquitetura

- Frontend: Angular + PO UI
- Backend: NestJS + TypeScript
- Integração: módulo isolado `DatasulModule`
- Sessão: cookie HttpOnly com segurança aplicada
- Layout: menu lateral + dashboard + perfil + shell corporativo

## Pré-requisitos

- Node.js 20 LTS
- npm
- Docker e Docker Compose
- acesso ao ambiente Datasul real para autenticação e integração

## Estrutura do projeto

```text
portal/
├── backend/
├── frontend/
├── docs/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── README.md
└── docs/discovery.md
```

## Configuração

Copie o exemplo de ambiente:

```bash
cp .env.example .env
```

Ajuste os valores conforme o ambiente Datasul real.

## Execução local

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

## Documentação

- [docs/discovery.md](docs/discovery.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/authentication.md](docs/authentication.md)
- [docs/datasul-integration.md](docs/datasul-integration.md)
- [docs/security.md](docs/security.md)

## Observação importante

O mecanismo oficial de autenticação do Datasul deve ser validado no ambiente real antes da ativação em produção. Esse projeto foi estruturado para suportar autenticação baseada no Datasul, mas não inventa APIs ou contratos que não sejam confirmados no ambiente alvo.
