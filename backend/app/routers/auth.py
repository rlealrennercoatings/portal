from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, Response
from pydantic import BaseModel

from .. import session_store
from ..config import Settings, get_settings
from ..datasul_client import DatasulAuthClient, DatasulAuthError
from ..deps import get_current_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    ok: bool
    username: str


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
):
    client = DatasulAuthClient(settings)
    try:
        datasul_session = await client.login(payload.username, payload.password)
    except DatasulAuthError as exc:
        return Response(
            content=_error_json(exc.message),
            media_type="application/json",
            status_code=exc.status_code if exc.status_code in (401, 502) else 401,
        )

    session_id = session_store.create_session(payload.username, datasul_session)

    response.set_cookie(
        key=settings.SECRET_COOKIE_NAME,
        value=session_id,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.SESSION_TTL_SECONDS,
        path="/",
    )
    return LoginResponse(ok=True, username=payload.username)


@router.post("/logout")
async def logout(
    response: Response,
    settings: Settings = Depends(get_settings),
    datasul_session: str | None = Cookie(default=None),
):
    if datasul_session:
        session_store.delete_session(datasul_session)
    response.delete_cookie(key=settings.SECRET_COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
async def me(session: dict = Depends(get_current_session)):
    ds_session = session["datasul_session"]
    return {
        "username": session["username"],
        "authenticated_at": ds_session.obtained_at,
        "has_jsessionid": "JSESSIONID" in ds_session.cookies,
    }


def _error_json(message: str) -> str:
    import json

    return json.dumps({"ok": False, "detail": message})
