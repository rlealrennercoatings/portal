"""Dependências reutilizáveis (injeção do FastAPI)."""
from __future__ import annotations

from fastapi import Cookie, HTTPException, status

from . import session_store
from .config import get_settings


async def get_current_session(
    datasul_session: str | None = Cookie(default=None),
) -> dict:
    """Garante que existe uma sessão válida (usuário autenticado no Datasul).

    Este ambiente autentica via cookie de sessão (JSESSIONID), não via
    Bearer/JWT com refresh_token. Por isso, quando a sessão expira, não há
    como renová-la silenciosamente: é necessário pedir um novo login ao
    usuário.
    """
    settings = get_settings()

    if not datasul_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")

    session = session_store.get_session(datasul_session)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada.")

    if session["datasul_session"].is_expired(settings.SESSION_TTL_SECONDS):
        session_store.delete_session(datasul_session)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada. Faça login novamente.",
        )

    return session
