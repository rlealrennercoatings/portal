@echo off
cd /d "%~dp0"

if not exist ".venv" (
    python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install --quiet -r requirements.txt

if not exist ".env" (
    copy .env.example .env
    echo Criado backend\.env a partir de .env.example. Ajuste as credenciais antes de usar em producao.
)

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
