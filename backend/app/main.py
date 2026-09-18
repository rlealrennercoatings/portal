from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .routers import auth, example_datasul, health

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(example_datasul.router)

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    async def index():
        return FileResponse(str(FRONTEND_DIR / "index.html"))

    @app.get("/dashboard")
    async def dashboard():
        return FileResponse(str(FRONTEND_DIR / "dashboard.html"))
