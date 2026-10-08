# Arquitetura do Portal

## Visão geral

A arquitetura da V1 foi projetada para separar claramente as responsabilidades:

- Frontend: experiência do usuário, layout e navegação.
- Backend: autenticação, sessão, APIs e integração com Datasul.
- Módulo Datasul: abstração das integrações oficiais do ambiente.

## Camadas

### Frontend

- Angular 17
- PO UI para componentes e layout corporativo
- módulo de autenticação e guarda de rotas
- shell e dashboard
- área de perfil com dados do usuário e grupos

### Backend

- NestJS 10
- módulos: auth, datasul, users, groups, health, common
- services para autenticação e sessão
- controladores REST para login, logout e dados do usuário

### Integração com Datasul

- `DatasulModule`
- `DatasulAuthService`
- `DatasulUserService`
- `DatasulGroupService`

## Princípios

- sem duplicação de usuários;
- sem senha armazenada;
- backend como único ponto de integração;
- estrutura extensível para futuras aplicações por área.
