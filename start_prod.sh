#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🎵 Iniciando Harmony Music em modo Produção..."

# 1. Garante que .env exista
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
fi

# 2. Ativa venv se existir
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

# 3. Encerra processos anteriores (Servidor & Cloudflared)
if [ -f "harmony.pid" ]; then
    OLD_PID=$(cat harmony.pid)
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "🛑 Encerrando servidor anterior (PID: $OLD_PID)..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
    rm -f harmony.pid
fi

if [ -f "cloudflared.pid" ]; then
    OLD_CF_PID=$(cat cloudflared.pid)
    if kill -0 "$OLD_CF_PID" 2>/dev/null; then
        echo "🛑 Encerrando Cloudflare Tunnel anterior (PID: $OLD_CF_PID)..."
        kill "$OLD_CF_PID" 2>/dev/null || true
        sleep 1
    fi
    rm -f cloudflared.pid
fi

rm -f public_url.txt

# 4. Inicia o servidor Harmony Music em segundo plano
nohup python3 run.py --port 5050 > server.log 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > harmony.pid
echo "✅ Servidor iniciado (PID: $SERVER_PID)"

# 5. Inicia o Cloudflare Tunnel para URL Pública Global com HTTPS
if command -v cloudflared >/dev/null 2>&1; then
    echo "☁️  Iniciando Cloudflare Tunnel para acesso público mundial..."
    nohup cloudflared tunnel --url http://localhost:5050 > cloudflared.log 2>&1 &
    CF_PID=$!
    echo "$CF_PID" > cloudflared.pid
    
    # Aguarda gerar a URL pública
    PUBLIC_URL=""
    for i in $(seq 1 12); do
        sleep 1
        if [ -f "cloudflared.log" ]; then
            URL_MATCH=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' cloudflared.log | head -n 1 || true)
            if [ -n "$URL_MATCH" ]; then
                PUBLIC_URL="$URL_MATCH"
                echo "$PUBLIC_URL" > public_url.txt
                break
            fi
        fi
    done

    if [ -n "$PUBLIC_URL" ]; then
        echo "🌐 URL Pública Ativa: $PUBLIC_URL"
    else
        echo "ℹ️  O túnel Cloudflare está iniciando em segundo plano. Verifique cloudflared.log para a URL."
    fi
else
    echo "💡 Dica: Instale o cloudflared ('pkg install cloudflared' no Termux) para gerar URL pública automática!"
fi

echo "📜 Logs: server.log | cloudflared.log"
