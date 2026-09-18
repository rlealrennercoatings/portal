"""
Cliente de autenticação para o TOTVS Datasul (totvs-login), baseado no
fluxo REAL observado neste ambiente (TOTVS Varejo - Linha Datasul 06.9):
login por formulário Spring Security com proteção CSRF, e não o fluxo
OAuth2 genérico documentado publicamente pela TOTVS.

Fluxo implementado:
  1. GET  DATASUL_LOGIN_FORM_PATH   -> pode envolver redirects internos até
                                        chegar na página HTML de login real,
                                        que contém o token _csrf embutido.
                                        Usamos follow_redirects=True para
                                        garantir que pousamos na página
                                        final, e não em uma resposta de
                                        redirecionamento intermediária.
  2. POST DATASUL_LOGIN_ACTION_PATH -> envia usuário/senha + _csrf + domínio.
                                        Se as credenciais forem válidas, o
                                        servidor encadeia uma série de
                                        redirects (login?back_to=... ->
                                        totvs-menu/?ticket=...) até uma
                                        página final autenticada. Como o
                                        cliente também segue redirects
                                        automaticamente aqui, terminamos já
                                        na página final, com o cookie de
                                        sessão (JSESSIONID) autenticado.

O resultado guardado por usuário não é um Bearer token, e sim os cookies de
sessão (principalmente JSESSIONID) que devem ser reenviados em toda chamada
futura às APIs/telas do Datasul, exatamente como um navegador faria.
"""
from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Any, Optional

import httpx

from .config import Settings

_CSRF_PATTERNS = [
    re.compile(r'name=["\']_csrf["\']\s+value=["\']([^"\']+)["\']', re.IGNORECASE | re.DOTALL),
    re.compile(r'value=["\']([^"\']+)["\']\s+name=["\']_csrf["\']', re.IGNORECASE | re.DOTALL),
    re.compile(r'<meta\s+name=["\']_csrf["\']\s+content=["\']([^"\']+)["\']', re.IGNORECASE | re.DOTALL),
    # Fallback: qualquer input cujo name seja _csrf, mesmo com outros
    # atributos (id, class, etc.) entre name e value, em qualquer ordem.
    re.compile(r'<input[^>]*name=["\']_csrf["\'][^>]*value=["\']([^"\']+)["\']', re.IGNORECASE | re.DOTALL),
    re.compile(r'<input[^>]*value=["\']([^"\']+)["\'][^>]*name=["\']_csrf["\']', re.IGNORECASE | re.DOTALL),
]

# Trechos de URL que indicam que ainda estamos em uma página de login
# (usado para detectar falha de autenticação após seguir os redirects).
_LOGIN_PAGE_MARKERS = ("loginform", "/totvs-login/login")


class DatasulAuthError(Exception):
    """Erro ao autenticar junto ao TOTVS Datasul."""

    def __init__(self, message: str, status_code: int = 401, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


@dataclass
class DatasulSession:
    """Sessão autenticada no TOTVS Datasul: guarda os cookies obtidos ao
    final do fluxo de login (não um Bearer/JWT)."""

    cookies: dict = field(default_factory=dict)
    obtained_at: float = field(default_factory=time.time)

    def is_expired(self, ttl_seconds: int) -> bool:
        return time.time() >= (self.obtained_at + ttl_seconds)

    def as_cookie_header(self) -> dict:
        """Retorna os cookies no formato aceito por httpx (dict simples)."""
        return dict(self.cookies)


def _extract_csrf(html: str) -> Optional[str]:
    for pattern in _CSRF_PATTERNS:
        match = pattern.search(html)
        if match:
            return match.group(1)
    return None


class DatasulAuthClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def login(self, username: str, password: str) -> DatasulSession:
        settings = self.settings

        async with httpx.AsyncClient(
            timeout=settings.DATASUL_TIMEOUT,
            verify=settings.DATASUL_VERIFY_SSL,
            follow_redirects=True,
            max_redirects=settings.DATASUL_MAX_REDIRECTS,
        ) as client:
            # 1) Página de login: cria sessão anônima + expõe o token _csrf.
            #    follow_redirects=True garante que pousamos na página HTML
            #    real do formulário, mesmo que haja redirects intermediários.
            try:
                form_resp = await client.get(settings.login_form_url)
            except httpx.RequestError as exc:
                raise DatasulAuthError(
                    f"Falha de comunicação com o TOTVS Datasul ({settings.login_form_url}): {exc}",
                    status_code=502,
                ) from exc

            csrf_token = _extract_csrf(form_resp.text)
            if not csrf_token:
                raise DatasulAuthError(
                    "Não foi possível localizar o token _csrf na página de login do Datasul "
                    f"(URL final: {form_resp.url}, status: {form_resp.status_code}). "
                    "A versão/tela pode ter mudado.",
                    status_code=502,
                    details=form_resp.text[:500],
                )

            # 2) Submete usuário/senha (mesmos campos observados no navegador).
            #    O cliente segue automaticamente toda a cadeia de redirects
            #    (login?back_to=... -> totvs-menu/?ticket=...) até a página
            #    final, coletando os cookies de sessão autenticada.
            data = {
                "j_username": username,
                "j_password": password,
                "_csrf": csrf_token,
                "j_domain": settings.DATASUL_DOMAIN,
                "chosenLang": settings.DATASUL_LANG,
            }
            try:
                login_resp = await client.post(settings.login_action_url, data=data)
            except httpx.RequestError as exc:
                raise DatasulAuthError(
                    f"Falha de comunicação com o TOTVS Datasul ({settings.login_action_url}): {exc}",
                    status_code=502,
                ) from exc

            final_url = str(login_resp.url).lower()
            cookies = dict(client.cookies)

            # Se, após seguir todos os redirects, ainda terminamos em uma
            # página de login, as credenciais foram rejeitadas.
            if any(marker in final_url for marker in _LOGIN_PAGE_MARKERS):
                raise DatasulAuthError(
                    "Usuário ou senha inválidos.",
                    status_code=401,
                    details=f"URL final: {login_resp.url}",
                )

            if "JSESSIONID" not in cookies:
                raise DatasulAuthError(
                    "Login não retornou uma sessão válida (JSESSIONID ausente). "
                    "Verifique usuário, senha e domínio.",
                    status_code=401,
                    details=f"URL final: {login_resp.url}",
                )

            return DatasulSession(cookies=cookies)
