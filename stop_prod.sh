#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# 1. Encerra o Servidor
if [ -f "harmony.pid" ]; then
    PID=$(cat harmony.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "🛑 Encerrando Harmony Music (PID: $PID)..."
        kill "$PID" 2>/dev/null || true
    fi
    rm -f harmony.pid
    echo "✅ Servidor encerrado."
else
    echo "ℹ️ Nenhum servidor em execução encontrado."
fi

# 2. Encerra o Cloudflare Tunnel
if [ -f "cloudflared.pid" ]; then
    CF_PID=$(cat cloudflared.pid)
    if kill -0 "$CF_PID" 2>/dev/null; then
        echo "🛑 Encerrando Cloudflare Tunnel (PID: $CF_PID)..."
        kill "$CF_PID" 2>/dev/null || true
    fi
    rm -f cloudflared.pid
    echo "✅ Cloudflare Tunnel encerrado."
fi

rm -f public_url.txt
