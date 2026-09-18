"""
Configurações da aplicação, lidas de variáveis de ambiente (.env).

Todas as configurações específicas do ambiente TOTVS Datasul do cliente
(hosts, client_id/secret, grant type, etc.) ficam centralizadas aqui.
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
    SESSION_TTL_SECONDS: int = 3600       # tempo de vida da sessão local (fallback)

    # --- TOTVS Datasul / OAuth2 (totvs-login) ---
    # Host base do ambiente Datasul (ex: https://erp-desenv.renner.com.br)
    DATASUL_BASE_URL: str = "https://SEU-HOST-DATASUL"
    # Caminho do endpoint de token do totvs-login (IdentityServer / OAuth2)
    DATASUL_TOKEN_PATH: str = "/totvs-login/connect/token"
    # Grant type utilizado para o login do usuário no portal:
    #   "password"           -> Resource Owner Password Credentials (login usuário/senha)
    #   "client_credentials"  -> machine-to-machine (sem usuário, usado por integrações)
    DATASUL_GRANT_TYPE: str = "password"
    DATASUL_CLIENT_ID: str = ""
    DATASUL_CLIENT_SECRET: str = ""
    DATASUL_SCOPE: str = ""
    # Empresa/estabelecimento padrão (muitos endpoints Datasul exigem contexto de empresa)
    DATASUL_COMPANY: str = ""
    # Verificação de certificado TLS (deixe True em produção)
    DATASUL_VERIFY_SSL: bool = True
    # Timeout (segundos) para chamadas ao TOTVS Datasul
    DATASUL_TIMEOUT: float = 15.0

    @property
    def token_url(self) -> str:
        return f"{self.DATASUL_BASE_URL.rstrip('/')}{self.DATASUL_TOKEN_PATH}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
