"""
Cliente OAuth2 para o serviço de autenticação do TOTVS Datasul (totvs-login).

Baseado no fluxo documentado pela TOTVS (TDN - "OAuth2", Linha Datasul):
https://tdn.totvs.com/display/LDT/OAuth2

O serviço "totvs-login" expõe um endpoint de token (padrão OAuth2 /
IdentityServer). Dois grant types são suportados pelo produto:

    * client_credentials -> integrações machine-to-machine (sem usuário)
    * password            -> Resource Owner Password Credentials, usado quando
                              uma aplicação (como este portal) coleta usuário e
                              senha para autenticar uma pessoa real.

Este módulo isola toda a comunicação HTTP com o TOTVS Datasul, para que o
restante da aplicação (rotas, sessão) não precise conhecer os detalhes do
protocolo. Quando novas APIs Progress 4GL forem consumidas futuramente, este
é o cliente que deve ser reaproveitado para anexar o Bearer token nas
chamadas.
"""
from __future__ import annotations

import base64
import json
import time
from dataclasses import dataclass
from typing import Any, Optional

import httpx

from .config import Settings


class DatasulAuthError(Exception):
    """Erro ao autenticar ou renovar token junto ao TOTVS Datasul."""

    def __init__(self, message: str, status_code: int = 401, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


@dataclass
class TokenResponse:
    access_token: str
    refresh_token: Optional[str]
    token_type: str
    expires_in: int
    obtained_at: float
    raw_claims: dict

    @property
    def expires_at(self) -> float:
        return self.obtained_at + self.expires_in

    def is_expired(self, skew_seconds: int = 30) -> bool:
        return time.time() >= (self.expires_at - skew_seconds)


def _decode_jwt_claims(token: str) -> dict:
    """Decodifica (sem validar assinatura) o payload de um JWT apenas para
    exibição de informações do usuário autenticado (ex.: nome, expiração).

    A validação de assinatura/integridade é responsabilidade do próprio
    TOTVS Datasul: o token só chega até aqui porque já foi emitido por ele
    através de uma chamada HTTPS direta e confiável ao totvs-login.
    """
    try:
        payload_segment = token.split(".")[1]
        padding = "=" * (-len(payload_segment) % 4)
        decoded = base64.urlsafe_b64decode(payload_segment + padding)
        return json.loads(decoded)
    except Exception:
        return {}


class DatasulAuthClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def _post_token(self, data: dict) -> TokenResponse:
        settings = self.settings
        async with httpx.AsyncClient(
            timeout=settings.DATASUL_TIMEOUT, verify=settings.DATASUL_VERIFY_SSL
        ) as client:
            try:
                response = await client.post(
                    settings.token_url,
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
            except httpx.RequestError as exc:
                raise DatasulAuthError(
                    f"Falha de comunicação com o TOTVS Datasul ({settings.token_url}): {exc}",
                    status_code=502,
                ) from exc

        if response.status_code != 200:
            raise DatasulAuthError(
                "Usuário ou senha inválidos, ou credenciais de aplicação (client_id/secret) incorretas.",
                status_code=401,
                details=_safe_body(response),
            )

        payload = response.json()
        access_token = payload.get("access_token")
        if not access_token:
            raise DatasulAuthError(
                "O TOTVS Datasul não retornou um access_token válido.",
                status_code=502,
                details=payload,
            )

        return TokenResponse(
            access_token=access_token,
            refresh_token=payload.get("refresh_token"),
            token_type=payload.get("token_type", "Bearer"),
            expires_in=int(payload.get("expires_in", 3600)),
            obtained_at=time.time(),
            raw_claims=_decode_jwt_claims(access_token),
        )

    async def login_with_password(self, username: str, password: str) -> TokenResponse:
        """Autentica um usuário real (Resource Owner Password Credentials)."""
        settings = self.settings
        data = {
            "grant_type": "password",
            "username": username,
            "password": password,
            "client_id": settings.DATASUL_CLIENT_ID,
            "client_secret": settings.DATASUL_CLIENT_SECRET,
        }
        if settings.DATASUL_SCOPE:
            data["scope"] = settings.DATASUL_SCOPE
        if settings.DATASUL_COMPANY:
            data["company"] = settings.DATASUL_COMPANY
        return await self._post_token(data)

    async def login_with_client_credentials(self) -> TokenResponse:
        """Autentica a própria aplicação (machine-to-machine), sem usuário."""
        settings = self.settings
        data = {
            "grant_type": "client_credentials",
            "client_id": settings.DATASUL_CLIENT_ID,
            "client_secret": settings.DATASUL_CLIENT_SECRET,
        }
        if settings.DATASUL_SCOPE:
            data["scope"] = settings.DATASUL_SCOPE
        return await self._post_token(data)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        settings = self.settings
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.DATASUL_CLIENT_ID,
            "client_secret": settings.DATASUL_CLIENT_SECRET,
        }
        return await self._post_token(data)


def _safe_body(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return response.text[:500]
