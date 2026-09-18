# Portal de Autenticação — TOTVS Datasul

Alicerce de uma aplicação web moderna que autentica no **TOTVS Datasul** (ambiente TOTVS Varejo — Linha
Datasul 06.9). Este é o primeiro passo de uma plataforma maior: depois que o login estiver validado, novas
telas/serviços poderão ser adicionados aqui mesmo para consumir telas/APIs Progress 4GL do Datasul,
reaproveitando a sessão já autenticada.

## ⚠️ Descoberta importante sobre a autenticação

A documentação pública da TOTVS descreve um fluxo OAuth2 genérico (`/totvs-login/connect/token`,
grant `password`/`client_credentials`). **Esse não é o fluxo usado neste ambiente.** Ao inspecionar a
requisição real feita pelo navegador ao logar em `erp-chile-desenv.renner.com.br/totvs-menu/`,
identificamos que o login é feito via **formulário Spring Security clássico**, com proteção CSRF:

1. `GET /totvs-login/loginForm` — pode envolver um ou mais redirects internos até chegar na página HTML
   real do formulário, que contém um token `_csrf` embutido (e cria uma sessão anônima, `JSESSIONID`).
2. `POST /totvs-login/ACS?login` — envia `j_username`, `j_password`, `_csrf`, `j_domain=RHSA`,
   `chosenLang=pt`. Se as credenciais forem válidas, o servidor encadeia uma série de redirects
   (`login?back_to=...` → `totvs-menu/?ticket=...`) até uma sessão autenticada (novo `JSESSIONID`).

**Não existe Bearer token/JWT neste fluxo.** O que autentica as chamadas seguintes é o **cookie de
sessão** (`JSESSIONID`), exatamente como em um navegador comum. O backend deste portal replica esse
fluxo internamente com `httpx` (`follow_redirects=True`, para não "tropeçar" em redirects intermediários
tanto na página de login quanto após o POST), e guarda os cookies resultantes associados à sessão do
usuário no portal — nunca expondo esses cookies ao navegador do usuário final.

## Arquitetura

```
datasul-auth-portal/
├── backend/                 # API FastAPI (Python)
│   └── app/
│       ├── main.py          # bootstrap da aplicação + serve o front-end
│       ├── config.py        # configurações via .env
│       ├── datasul_client.py# fluxo real de login (form + CSRF + cookies)
│       ├── session_store.py # sessão do portal (cookies Datasul guardados no servidor)
│       ├── deps.py          # dependência que garante sessão válida
│       └── routers/
│           ├── auth.py            # /api/auth/login, /logout, /me
│           ├── health.py          # /api/health
│           └── example_datasul.py # MODELO para futuras chamadas ao Datasul
├── frontend/                # HTML/CSS/JS estático (sem dependências externas)
├── deploy/
│   └── nginx-portal.conf    # vhost de exemplo para o nginx_proxy do RHSA342
├── Dockerfile / docker-compose.yml
└── backend/run.sh / run.bat # scripts para rodar em Linux ou Windows (dev)
```

### Como a autenticação funciona neste portal

1. O usuário informa usuário/senha na tela de login (`frontend/index.html`).
2. O backend (`datasul_client.py`) faz o `GET` na página de login do Datasul (seguindo redirects até a
   página real), extrai o `_csrf` do HTML, e faz o `POST` para `ACS?login` com as credenciais — seguindo
   automaticamente toda a cadeia de redirects até a sessão ficar autenticada.
3. **Os cookies do Datasul nunca são enviados ao navegador do usuário.** O backend guarda esses cookies
   em uma sessão server-side e devolve ao navegador apenas um cookie `httpOnly` com um identificador de
   sessão opaco do próprio portal.
4. Chamadas seguintes (ex.: `/api/auth/me`, ou qualquer tela/API Progress 4GL futura) reaproveitam esses
   cookies internamente. Como não há `refresh_token` neste modelo, quando a sessão expira
   (`SESSION_TTL_SECONDS`), o usuário precisa logar novamente — não há renovação silenciosa.

## Configuração

```bash
cd backend
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATASUL_BASE_URL` | Host do ambiente (ex.: `https://erp-chile-desenv.renner.com.br`) |
| `DATASUL_LOGIN_FORM_PATH` | Página de login (padrão `/totvs-login/loginForm`) |
| `DATASUL_LOGIN_ACTION_PATH` | Endpoint que processa o login (padrão `/totvs-login/ACS?login`) |
| `DATASUL_DOMAIN` | Domínio de autenticação (fixo neste ambiente: `RHSA`) |
| `DATASUL_LANG` | Idioma enviado no login (`pt`) |
| `SESSION_TTL_SECONDS` | Tempo de vida assumido da sessão antes de exigir novo login |
| `COOKIE_SECURE` | Defina `true` em produção (exige HTTPS) |

> Se outro ambiente Datasul (ex.: produção, ou outra unidade/país) usar uma versão diferente do produto,
> os paths e o `_csrf` podem variar — repita o processo de inspeção via DevTools (Network) para confirmar.

## 1. Rodar em desenvolvimento

```bash
cd backend
cp .env.example .env      # edite DATASUL_BASE_URL com o ambiente desejado
./run.sh                  # Linux/macOS  (Windows: run.bat)
```

Acesse `http://localhost:8000`.

## 2. Publicar no RHSA342 (mesmo conceito do Ender Contatos)

```bash
sudo mkdir -p /srv/apps/portal
cd /srv/apps/portal
git clone https://github.com/rlealrennercoatings/portal.git .

cd backend
cp .env.production.example .env
nano .env   # preencher DATASUL_BASE_URL real

cd /srv/apps/portal
docker compose up -d --build
docker logs -f portal_app
```

Depois, adicione o vhost `deploy/nginx-portal.conf` (usa o domínio `portal.renner.com.br`, reaproveitando
o certificado wildcard `*.renner.com.br` já existente) ao `nginx_proxy`:
```bash
cp deploy/nginx-portal.conf /srv/proxy/nginx/conf.d/portal.conf
docker exec nginx_proxy nginx -t
docker exec nginx_proxy nginx -s reload
```

### Operação do dia a dia
```bash
cd /srv/apps/portal
docker compose up -d           # subir
docker compose down            # parar
docker compose restart         # reiniciar
docker logs -f portal_app      # ver logs
git pull && docker compose up -d --build   # atualizar
```

## Próximos passos sugeridos

- **Novas telas/APIs Datasul:** siga o modelo em `backend/app/routers/example_datasul.py`, sempre
  reaproveitando `Depends(get_current_session)` e repassando `cookies=ds_session.as_cookie_header()`
  nas chamadas httpx (não `Authorization: Bearer`).
- **Sessão distribuída:** troque `session_store.py` (dict em memória) por Redis antes de escalar para
  múltiplas instâncias do backend.
- **Segurança de credenciais:** nunca compartilhe usuário/senha reais em capturas de tela ou logs ao
  depurar o fluxo de login — trate qualquer senha exposta acidentalmente como comprometida e troque-a.

## Referências

- TOTVS TDN — CFG OAuth2 (documentação genérica, não aplicável a este ambiente): https://tdn.totvs.com/display/LDT/CFG+-+OAuth2
- Fluxo real identificado por inspeção via DevTools em `erp-chile-desenv.renner.com.br` (18/09/2026).
