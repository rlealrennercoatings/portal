#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install --quiet -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ">> Criado backend/.env a partir de .env.example. Ajuste as credenciais antes de usar em produção."
fi

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
