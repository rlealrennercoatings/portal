"""
Armazenamento de sessões do portal.

Implementação simples em memória (dict), adequada para desenvolvimento e
para uma primeira validação em produção com uma única instância do processo.

Diferente de um fluxo Bearer/JWT, aqui o que é guardado por sessão são os
COOKIES da sessão autenticada no TOTVS Datasul (principalmente JSESSIONID),
já que este ambiente autentica via login de formulário (Spring Security),
não OAuth2. Esses cookies nunca são enviados ao navegador do usuário: o
front-end recebe apenas um cookie httpOnly com um identificador de sessão
opaco (session_id) do PRÓPRIO portal.

Para rodar em produção com múltiplas instâncias/réplicas, troque este dict
por Redis (ex.: biblioteca `redis` + serialização json), mantendo a mesma
interface (get/set/delete) usada pelo restante da aplicação.
"""
from __future__ import annotations

import secrets
import time
from typing import Optional

from .datasul_client import DatasulSession

_SESSIONS: dict[str, dict] = {}


def create_session(username: str, datasul_session: DatasulSession) -> str:
    session_id = secrets.token_urlsafe(32)
    _SESSIONS[session_id] = {
        "username": username,
        "datasul_session": datasul_session,
        "created_at": time.time(),
    }
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    return _SESSIONS.get(session_id)


def delete_session(session_id: str) -> None:
    _SESSIONS.pop(session_id, None)
