"""Dependências reutilizáveis (injeção do FastAPI)."""
from __future__ import annotations

from fastapi import Cookie, HTTPException, status

from . import session_store
from .config import get_settings
from .datasul_client import DatasulAuthClient, DatasulAuthError


async def get_current_session(
    datasul_session: str | None = Cookie(default=None),
) -> dict:
    """Garante que existe uma sessão válida (usuário autenticado no Datasul).

    Renova automaticamente o token junto ao TOTVS Datasul caso esteja
    expirado e exista um refresh_token disponível.
    """
    if not datasul_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")

    session = session_store.get_session(datasul_session)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada.")

    token = session["token"]
    if token.is_expired():
        if not token.refresh_token:
            session_store.delete_session(datasul_session)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sessão expirada. Faça login novamente.",
            )
        try:
            client = DatasulAuthClient(get_settings())
            new_token = await client.refresh(token.refresh_token)
        except DatasulAuthError:
            session_store.delete_session(datasul_session)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Não foi possível renovar a sessão. Faça login novamente.",
            )
        session_store.update_token(datasul_session, new_token)
        session["token"] = new_token

    return session
