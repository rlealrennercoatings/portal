"""
EXEMPLO / MODELO para as próximas aplicações.

Este arquivo mostra como uma futura tela ou serviço deste portal deve
chamar um endpoint/tela do TOTVS Datasul reaproveitando a sessão (cookies)
já obtida no login. Neste ambiente, a autenticação é por cookie de sessão
(JSESSIONID), não por Bearer token — por isso repassamos `cookies=` na
chamada httpx, e não um header `Authorization`.

Quando for construir uma nova funcionalidade:
  1. Copie o padrão deste router para um novo arquivo em `routers/`.
  2. Troque a URL/rota pelo endpoint real do programa Progress 4GL.
  3. Sempre injete `Depends(get_current_session)` para exigir login.
  4. Registre o novo router em `main.py`.
"""
from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException

from ..config import Settings, get_settings
from ..deps import get_current_session

router = APIRouter(prefix="/api/datasul", tags=["datasul-example"])


@router.get("/whoami")
async def whoami(
    session: dict = Depends(get_current_session),
    settings: Settings = Depends(get_settings),
):
    """Chamada de exemplo a uma tela/endpoint do Datasul reaproveitando os
    cookies de sessão obtidos no login. Ajuste a URL para um endpoint real
    do seu ambiente.
    """
    ds_session = session["datasul_session"]
    example_url = f"{settings.DATASUL_BASE_URL.rstrip('/')}/totvs-menu/"

    async with httpx.AsyncClient(timeout=settings.DATASUL_TIMEOUT, verify=settings.DATASUL_VERIFY_SSL) as client:
        try:
            resp = await client.get(
                example_url,
                cookies=ds_session.as_cookie_header(),
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Falha ao chamar Datasul: {exc}")

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text[:500])

    return {"status": "ok", "length": len(resp.text)}
