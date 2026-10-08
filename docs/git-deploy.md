# Deploy via Git para produção

Este repositório pode ser publicado em produção usando Git como fonte de verdade, seguindo o fluxo:

DEV -> Git -> PR/Merge -> PROD

## Estrutura recomendada

- `dev`: ambiente de desenvolvimento
- `main`: ambiente de produção
- `tags` opcionais para versões estáveis (`v1.0.0`, `v1.0.1`)

## Fluxo recomendado

```bash
git checkout dev
git pull
git add .
git commit -m "feat: nova funcionalidade"
git push origin dev
```

Depois, abra o PR para `main` e faça o merge somente após validação.

```bash
git checkout main
git pull origin main
```

## Deploy no servidor de produção

No servidor RHSA342, configure as variáveis de ambiente e execute:

```bash
export PORTAL_DEPLOY_HOST=10.3.1.142
export PORTAL_DEPLOY_USER=deploy
export PORTAL_DEPLOY_PATH=/srv/apps/portal
export PORTAL_DEPLOY_REPO_URL=https://github.com/seu-usuario/portal.git
export PORTAL_DEPLOY_BRANCH=main

bash /srv/apps/portal/scripts/deploy-git-prod.sh
```

Se o script estiver no repositório local, também pode ser executado assim:

```bash
PORTAL_DEPLOY_HOST=10.3.1.142 \
PORTAL_DEPLOY_USER=deploy \
PORTAL_DEPLOY_PATH=/srv/apps/portal \
PORTAL_DEPLOY_REPO_URL=https://github.com/seu-usuario/portal.git \
PORTAL_DEPLOY_BRANCH=main \
./scripts/deploy-git-prod.sh
```

## Rollback

Para voltar para um commit ou tag anterior:

```bash
PORTAL_DEPLOY_HOST=10.3.1.142 \
PORTAL_DEPLOY_USER=deploy \
PORTAL_DEPLOY_PATH=/srv/apps/portal \
./scripts/rollback-prod.sh HEAD~1
```

Ou para uma tag:

```bash
PORTAL_DEPLOY_HOST=10.3.1.142 \
PORTAL_DEPLOY_USER=deploy \
PORTAL_DEPLOY_PATH=/srv/apps/portal \
./scripts/rollback-prod.sh v1.0.0
```

## Observações

- O deploy em produção deve ser acionado apenas após merge em `main`.
- Use o Git como fonte de verdade; nunca faça upload direto de um ambiente local para o servidor.
- Se o portal for gerenciado com PM2 ou systemd, reinicie o processo após o build.
