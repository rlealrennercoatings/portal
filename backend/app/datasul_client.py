"""
Cliente de autenticação para o TOTVS Datasul (totvs-login), baseado no
fluxo REAL observado neste ambiente (TOTVS Varejo - Linha Datasul 06.9):
login por formulário Spring Security com proteção CSRF, e não o fluxo
OAuth2 genérico documentado publicamente pela TOTVS.

Fluxo implementado:
  1. GET  DATASUL_LOGIN_FORM_PATH   -> obtém uma sessão anônima (cookie) e
                                        extrai o token _csrf embutido no HTML.
  2. POST DATASUL_LOGIN_ACTION_PATH -> envia usuário/senha + _csrf + domínio.
                                        Se as credenciais forem válidas, o
                                        servidor responde com um redirect
                                        (302/303) e troca o cookie de sessão
                                        por um já autenticado.
  3. Segue manualmente a cadeia de redirects (login?back_to=... ->
     totvs-menu/?ticket=...) até não haver mais redirect, confirmando que a
     sessão ficou autenticada.

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
    re.compile(r'name=["\']_csrf["\']\s+value=["\']([^"\']+)["\']', re.IGNORECASE),
    re.compile(r'value=["\']([^"\']+)["\']\s+name=["\']_csrf["\']', re.IGNORECASE),
    re.compile(r'<meta\s+name=["\']_csrf["\']\s+content=["\']([^"\']+)["\']', re.IGNORECASE),
]


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
            follow_redirects=False,
        ) as client:
            # 1) Página de login: cria sessão anônima + expõe o token _csrf
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
                    "Não foi possível localizar o token _csrf na página de login do Datasul. "
                    "A versão/tela pode ter mudado.",
                    status_code=502,
                )

            # 2) Submete usuário/senha (mesmos campos observados no navegador)
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

            if login_resp.status_code not in (302, 303):
                raise DatasulAuthError(
                    "Usuário ou senha inválidos.",
                    status_code=401,
                    details=login_resp.text[:300],
                )

            # 3) Segue a cadeia de redirects manualmente (login?back_to=... ->
            #    totvs-menu/?ticket=...) até estabilizar a sessão autenticada.
            location = login_resp.headers.get("location")
            hops = 0
            while location and hops < settings.DATASUL_MAX_REDIRECTS:
                next_url = location if location.startswith("http") else (
                    f"{settings.DATASUL_BASE_URL.rstrip('/')}{location}"
                    if location.startswith("/")
                    else f"{settings.DATASUL_BASE_URL.rstrip('/')}/{location}"
                )
                try:
                    hop_resp = await client.get(next_url)
                except httpx.RequestError as exc:
                    raise DatasulAuthError(
                        f"Falha ao seguir redirecionamento do Datasul ({next_url}): {exc}",
                        status_code=502,
                    ) from exc

                if hop_resp.status_code not in (301, 302, 303, 307, 308):
                    break
                location = hop_resp.headers.get("location")
                hops += 1

            cookies = dict(client.cookies)
            if "JSESSIONID" not in cookies:
                raise DatasulAuthError(
                    "Login não retornou uma sessão válida (JSESSIONID ausente). "
                    "Verifique usuário, senha e domínio.",
                    status_code=401,
                )

            return DatasulSession(cookies=cookies)
