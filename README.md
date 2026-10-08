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

### Frontend por ambiente

O Angular agora usa configurações específicas para desenvolvimento e produção:

- desenvolvimento: `src/environments/environment.ts`
- produção: `src/environments/environment.prod.ts`

Os valores de API são carregados a partir do ambiente atual, permitindo alternar facilmente entre `localhost` e o servidor de produção sem alterar código.

## Execução local

### Iniciar backend e frontend juntos

Na raiz do projeto:

```bash
npm install
npm run start
```

Esse comando sobe o backend em `http://localhost:3000` e o frontend em `http://localhost:4200` ao mesmo tempo.

### Iniciar separadamente

```bash
npm run start:backend
npm run start:frontend
```

### Parar os serviços locais

```bash
npm run stop
```

### Build de produção

```bash
npm run build
```

## Documentação

- [docs/discovery.md](docs/discovery.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/authentication.md](docs/authentication.md)
- [docs/datasul-integration.md](docs/datasul-integration.md)
- [docs/security.md](docs/security.md)

## Observação importante

O mecanismo oficial de autenticação do Datasul deve ser validado no ambiente real antes da ativação em produção. Esse projeto foi estruturado para suportar autenticação baseada no Datasul, mas não inventa APIs ou contratos que não sejam confirmados no ambiente alvo.
