#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# 📱 CONFIGURAÇÕES DO SERVIDOR TERMUX
# ============================================================
SSH_USER="${SSH_USER:-u0_a128}"
SSH_HOST="${SSH_HOST:-192.168.0.176}"
SSH_PORT="${SSH_PORT:-8022}"
export SSHPASS="${SSHPASS:-123456}"

REMOTE_DIR="${REMOTE_DIR:-/data/data/com.termux/files/home/storage/harmony-music}"
PROD_SCRIPT="start_prod.sh"

SYNC_MUSIC=false
for arg in "$@"; do
    if [ "$arg" == "--with-music" ] || [ "$arg" == "-m" ]; then
        SYNC_MUSIC=true
    fi
done

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=15 -o ServerAliveInterval=10 -o ServerAliveCountMax=5 -p $SSH_PORT"

echo "============================================================"
echo " 🚀 INICIANDO DEPLOY DO HARMONY MUSIC PARA O TERMUX"
echo " 📍 Destino: $SSH_USER@$SSH_HOST:$SSH_PORT -> $REMOTE_DIR"
if [ "$SYNC_MUSIC" = true ]; then
    echo " 🎵 Modo: Sincronizar Código + Biblioteca de Músicas"
else
    echo " ⚡ Modo: Deploy Rápido de Código (use --with-music para enviar faixas)"
fi
echo "============================================================"

# 1. Verifica se o sshpass está instalado
if ! command -v sshpass >/dev/null 2>&1; then
    echo "⚠️ O utilitário 'sshpass' não foi encontrado. Instale com: sudo apt install sshpass"
    exit 1
fi

# 2. Garante que o diretório remoto exista no celular
echo "📁 Verificando diretório remoto no Termux..."
sshpass -e ssh $SSH_OPTS "$SSH_USER@$SSH_HOST" "mkdir -p $REMOTE_DIR"

# 3. Define exclusões do rsync
EXCLUDES=(
    --exclude='.git'
    --exclude='venv'
    --exclude='.venv'
    --exclude='__pycache__'
    --exclude='*.pyc'
    --exclude='.env'
    --exclude='server.log'
    --exclude='cloudflared.log'
    --exclude='harmony.pid'
    --exclude='cloudflared.pid'
    --exclude='public_url.txt'
    --exclude='data/*.db-wal'
    --exclude='data/*.db-shm'
    --exclude='data/temp/*'
)

if [ "$SYNC_MUSIC" = false ]; then
    EXCLUDES+=(--exclude='library/*')
fi

# 4. Sincroniza arquivos do projeto via rsync
echo "📦 Sincronizando arquivos do projeto..."
sshpass -e rsync -avz --partial --inplace "${EXCLUDES[@]}" -e "ssh $SSH_OPTS" ./ "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

# 5. Atualiza dependências e reinicia o servidor no Termux
echo "⚙️  Atualizando dependências e iniciando servidor com Cloudflare Tunnel..."
sshpass -e ssh -t $SSH_OPTS "$SSH_USER@$SSH_HOST" "bash -c '
    cd $REMOTE_DIR
    chmod +x start.sh start_prod.sh stop_prod.sh 2>/dev/null || true
    
    if [ ! -d \"venv\" ] && [ ! -d \".venv\" ]; then
        echo \"📦 Criando venv no Termux...\"
        python3 -m venv venv
    fi

    if [ -f \"venv/bin/activate\" ]; then
        source venv/bin/activate
    elif [ -f \".venv/bin/activate\" ]; then
        source .venv/bin/activate
    fi

    echo \"📥 Instalando dependências (requirements.txt)...\"
    pip install -r requirements.txt --quiet
    
    echo \"🚀 Iniciando aplicação em produção e Cloudflare Tunnel...\"
    bash $PROD_SCRIPT
'"

# 6. Obtém a URL Pública gerada pelo Cloudflare
PUBLIC_URL=""
PUBLIC_URL=$(sshpass -e ssh $SSH_OPTS "$SSH_USER@$SSH_HOST" "cat $REMOTE_DIR/public_url.txt 2>/dev/null || true")

echo ""
echo "============================================================"
echo " ✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo " 📱 Na Rede Local (Wi-Fi):  http://$SSH_HOST:5050"
if [ -n "$PUBLIC_URL" ]; then
    echo " ☁️  URL Pública (Mundial): $PUBLIC_URL"
else
    echo " ☁️  URL Pública: Verifique em 'cloudflared.log' no servidor"
fi
echo "============================================================"
