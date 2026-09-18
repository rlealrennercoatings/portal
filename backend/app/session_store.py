"""
Armazenamento de sessões do portal.

Implementação simples em memória (dict), adequada para desenvolvimento e
para uma primeira validação em produção com uma única instância do processo.

O token de acesso do TOTVS Datasul (JWT) NUNCA é enviado ao navegador: o
front-end recebe apenas um cookie httpOnly com um identificador de sessão
opaco (session_id). O token real fica somente no servidor, associado a esse
session_id. Isso evita exposição do token via JavaScript/XSS.

Para rodar em produção com múltiplas instâncias/réplicas, troque este dict
por Redis (ex.: biblioteca `redis` + serialização json), mantendo a mesma
interface (get/set/delete) usada pelo restante da aplicação.
"""
from __future__ import annotations

import secrets
import time
from typing import Optional

from .datasul_client import TokenResponse

_SESSIONS: dict[str, dict] = {}


def create_session(username: str, token: TokenResponse) -> str:
    session_id = secrets.token_urlsafe(32)
    _SESSIONS[session_id] = {
        "username": username,
        "token": token,
        "created_at": time.time(),
    }
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    return _SESSIONS.get(session_id)


def update_token(session_id: str, token: TokenResponse) -> None:
    if session_id in _SESSIONS:
        _SESSIONS[session_id]["token"] = token


def delete_session(session_id: str) -> None:
    _SESSIONS.pop(session_id, None)
