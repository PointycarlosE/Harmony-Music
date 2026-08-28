#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# 1. Garante que o arquivo .env exista
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📄 Criando arquivo de configuração .env a partir do .env.example..."
    cp .env.example .env
fi

# 2. Cria ou ativa o ambiente virtual Python
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "📦 Criando ambiente virtual Python (venv)..."
    python3 -m venv venv
fi

if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# 3. Garante que os pacotes básicos estejam instalados
if ! python3 -c "import flask, waitress" 2>/dev/null; then
    echo "📥 Instalando dependências necessárias (requirements.txt)..."
    pip install -r requirements.txt
fi

# 4. Inicia o servidor Harmony Music
python3 run.py "$@"
