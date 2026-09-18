# Portal de Autenticação — TOTVS Datasul

Alicerce de uma aplicação web moderna que autentica no **TOTVS Datasul via API REST (OAuth2 / `totvs-login`)**.
Este é o primeiro passo de uma plataforma maior: depois que o login estiver validado, novas telas/serviços
poderão ser adicionados aqui mesmo para consumir APIs Progress 4GL do Datasul, reaproveitando a sessão já
autenticada.

## Arquitetura

```
datasul-auth-portal/
├── backend/                 # API FastAPI (Python)
│   └── app/
│       ├── main.py          # bootstrap da aplicação + serve o front-end
│       ├── config.py        # configurações via .env
│       ├── datasul_client.py# cliente OAuth2 do totvs-login (login, refresh)
│       ├── session_store.py # sessão do portal (token nunca vai ao navegador)
│       ├── deps.py          # dependência que garante sessão válida/renovada
│       └── routers/
│           ├── auth.py            # /api/auth/login, /logout, /me
│           ├── health.py          # /api/health
│           └── example_datasul.py # MODELO para futuras chamadas ao Datasul
├── frontend/                # HTML/CSS/JS estático (sem dependências externas)
│   ├── index.html           # tela de login
│   ├── dashboard.html        # painel pós-login (placeholder)
│   ├── styles.css / app.js / dashboard.js
├── deploy/
│   └── nginx-portal.conf    # vhost de exemplo para o nginx_proxy do RHSA342
├── Dockerfile / docker-compose.yml
└── backend/run.sh / run.bat # scripts para rodar em Linux ou Windows (dev)
```

### Como a autenticação funciona

1. O usuário informa usuário/senha na tela de login (`frontend/index.html`).
2. O backend chama o endpoint de token do **totvs-login** (`DATASUL_TOKEN_PATH`, por padrão
   `/totvs-login/connect/token`) usando o grant **`password`** (Resource Owner Password Credentials),
   conforme o modelo OAuth2 documentado pela TOTVS para a Linha Datasul.
3. O TOTVS Datasul retorna um `access_token` (JWT) e, geralmente, um `refresh_token`.
4. **O token nunca é enviado ao navegador.** O backend guarda o token em uma sessão server-side e devolve
   apenas um cookie `httpOnly` com um identificador de sessão opaco.
5. Chamadas seguintes (ex.: `/api/auth/me`, ou qualquer API Progress 4GL futura) usam essa sessão; se o
   token expirar, o backend tenta renová-lo automaticamente com o `refresh_token`.

## 1. Rodar em desenvolvimento

```bash
cd backend
cp .env.example .env      # edite com os dados do seu ambiente Datasul
./run.sh                  # Linux/macOS  (Windows: run.bat)
```

Acesse `http://localhost:8000`. O servidor sobe com `--reload`, recarregando a cada alteração de código.

## 2. Publicar no RHSA342 (mesmo conceito do Ender Contatos)

Este servidor já roda um `nginx_proxy` central em `/srv/proxy` que faz HTTPS/reverse-proxy para os demais
apps (ex.: `ender.renner.com.br`), todos conectados a uma rede Docker externa chamada **`proxy_net`**.
O portal segue exatamente o mesmo padrão: um container próprio, na mesma rede, sem nenhuma porta publicada
diretamente no host — quem expõe é o `nginx_proxy`.

### Passo a passo

**1. Criar a pasta do app** (mesmo padrão de `/srv/apps/ender_contatos`):
```bash
sudo mkdir -p /srv/apps/portal
sudo chown $USER:$USER /srv/apps/portal
```

**2. Copiar/clonar o projeto** para dentro dessa pasta (ex. via git, se você versionar o portal em um
repositório próprio como fez com o `ender_contatos`):
```bash
cd /srv/apps/portal
git clone <seu-repositorio-do-portal> .
# ou: copiar os arquivos deste projeto para cá
```

**3. Configurar o `.env` de produção:**
```bash
cd /srv/apps/portal/backend
cp .env.production.example .env
nano .env   # preencher DATASUL_BASE_URL, DATASUL_CLIENT_ID/SECRET, etc.
```
Note que `COOKIE_SECURE=true` já vem habilitado neste template — é obrigatório, pois o cookie de sessão só
trafega em HTTPS (o nginx_proxy é quem termina o TLS).

**4. Conferir o nome exato da rede do proxy:**
```bash
docker network ls | grep proxy
```
O `docker-compose.yml` do portal já assume `proxy_net` (nome usado no Ender Contatos). Se no seu
`nginx_proxy` o nome for diferente (ex. `srv-proxy_proxy_net`, dependendo do nome da pasta do compose),
ajuste o campo `networks.proxy_net` em `docker-compose.yml` de acordo.

**5. Subir o container:**
```bash
cd /srv/apps/portal
docker compose up -d --build
docker logs -f portal_app   # conferir se subiu sem erros
```

**6. Adicionar o vhost no nginx_proxy:**
Copie `deploy/nginx-portal.conf` para o diretório de configuração do seu `nginx_proxy` (o mesmo local onde
está a config de `ender.renner.com.br`), ajustando os caminhos de certificado se necessário:
```bash
cp /srv/apps/portal/deploy/nginx-portal.conf /srv/proxy/<pasta-de-configs>/portal.conf
docker exec nginx_proxy nginx -t          # valida a sintaxe
docker exec nginx_proxy nginx -s reload   # aplica sem downtime
```

**7. Emitir o certificado SSL** (depois que o DNS `portal.rennercoatings.com` estiver apontando para o
RHSA342), com o mesmo certbot já usado para os outros domínios:
```bash
docker exec nginx_proxy certbot --nginx -d portal.rennercoatings.com
```
(ou o fluxo equivalente que vocês já usam para renovar os certificados dos demais vhosts em
`/srv/proxy/certs`).

**8. Testar:**
```bash
curl -I https://portal.rennercoatings.com/api/health
```

### Operação do dia a dia (igual ao Ender Contatos)

```bash
cd /srv/apps/portal
docker compose up -d           # subir
docker compose down            # parar
docker compose restart         # reiniciar
docker logs -f portal_app      # ver logs
```

### Deploy de atualizações
```bash
cd /srv/apps/portal
git pull
docker compose up -d --build
```

## Próximos passos sugeridos

- **Novas APIs Datasul:** siga o modelo em `backend/app/routers/example_datasul.py` para consumir cada
  programa Progress 4GL publicado como API REST, sempre reaproveitando `Depends(get_current_session)`.
- **Sessão distribuída:** troque `session_store.py` (dict em memória) por Redis antes de escalar para
  múltiplas instâncias do backend.
- **Backup:** como o portal não usa banco de dados, o único estado a proteger é o `.env` (credenciais);
  vale versioná-lo separadamente em um cofre de segredos.

## Referências

- TOTVS TDN — OAuth2 (Linha Datasul): https://tdn.totvs.com/display/LDT/OAuth2
- TOTVS TDN — Desenvolvimento de APIs para o produto Datasul: https://tdn.totvs.com/display/LDT/Desenvolvimento+de+APIs+para+o+produto+Datasul
