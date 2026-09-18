"""
Configurações da aplicação, lidas de variáveis de ambiente (.env).

IMPORTANTE (descoberto via inspeção do fluxo real de login no ambiente
TOTVS Varejo - Linha Datasul 06.9, servidor erp-chile-desenv):

Este ambiente NÃO usa o fluxo OAuth2 "Resource Owner Password Credentials"
descrito genericamente na documentação da TOTVS (endpoint
/totvs-login/connect/token). Em vez disso, o "totvs-login" usa um login
clássico baseado em formulário (Spring Security), com:

  - GET  /totvs-login/loginForm   -> (pode envolver redirects internos)
                                      até chegar na página HTML de login,
                                      que contém um token _csrf embutido e
                                      cria uma sessão anônima (JSESSIONID).
  - POST /totvs-login/ACS?login   -> envia j_username, j_password, _csrf,
                                      j_domain e chosenLang. Em caso de
                                      sucesso, o servidor encadeia vários
                                      redirects (login?back_to=... ->
                                      totvs-menu/?ticket=...) até estabelecer
                                      uma sessão autenticada (novo JSESSIONID).

Ou seja: a "credencial" que o portal precisa guardar por usuário não é um
Bearer/JWT, e sim o cookie de sessão (JSESSIONID) obtido ao final desse
fluxo. Esse cookie deve ser reenviado nas chamadas seguintes às APIs
Progress 4GL, da mesma forma que um navegador faria.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    # --- Aplicação ---
    APP_NAME: str = "Portal de Autenticação - TOTVS Datasul"
    APP_ENV: str = "development"          # development | production
    SECRET_COOKIE_NAME: str = "datasul_session"
    COOKIE_SECURE: bool = False           # True em produção (HTTPS obrigatório)
    SESSION_TTL_SECONDS: int = 1800       # tempo de vida assumido da sessão Datasul (JSESSIONID)

    # --- TOTVS Datasul (login por formulário / Spring Security) ---
    # Host base do ambiente Datasul (ex: https://erp-chile-desenv.renner.com.br)
    DATASUL_BASE_URL: str = "https://SEU-HOST-DATASUL"
    DATASUL_LOGIN_FORM_PATH: str = "/totvs-login/loginForm"
    DATASUL_LOGIN_ACTION_PATH: str = "/totvs-login/ACS?login"
    # Domínio de autenticação (fixo neste ambiente: RHSA)
    DATASUL_DOMAIN: str = "RHSA"
    DATASUL_LANG: str = "pt"
    # Máximo de redirects a seguir (GET inicial e POST de login podem
    # envolver várias etapas até a sessão ficar estabelecida).
    DATASUL_MAX_REDIRECTS: int = 20

    # Verificação de certificado TLS (deixe True em produção)
    DATASUL_VERIFY_SSL: bool = True
    # Timeout (segundos) para chamadas ao TOTVS Datasul
    DATASUL_TIMEOUT: float = 15.0

    @property
    def login_form_url(self) -> str:
        return f"{self.DATASUL_BASE_URL.rstrip('/')}{self.DATASUL_LOGIN_FORM_PATH}"

    @property
    def login_action_url(self) -> str:
        return f"{self.DATASUL_BASE_URL.rstrip('/')}{self.DATASUL_LOGIN_ACTION_PATH}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
