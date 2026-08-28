# 📱 Guia de Implantação 24/7 no Termux (Android) & Cloudflare Tunnel

Este guia ensina como transformar um smartphone antigo com **Android + Termux** em um **servidor de música 24/7 de alta fidelidade** acessível de qualquer lugar do mundo gratuitamente via **Cloudflare Tunnel** (com HTTPS/SSL).

---

## ⚡ Passo 1: Preparar o Termux no Celular

1. Instale o **Termux** atualizado através do [F-Droid](https://f-droid.org/packages/com.termux/) (evite a versão defasada da Play Store).
2. Abra o Termux e execute o comando de atualização:
   ```bash
   pkg update && pkg upgrade -y
   ```
3. Instale o Python, FFmpeg, Git e utilitários:
   ```bash
   pkg install -y python ffmpeg git cloudflared termux-tools
   ```
4. Permita que o Termux acesse o armazenamento do celular (opcional se quiser guardar músicas no cartão SD):
   ```bash
   termux-setup-storage
   ```
5. **Evite que o Android feche o servidor (Economia de Bateria):**
   * Puxe a barra de notificações do Android, toque na notificação do Termux e clique em **Acquire Wake Lock** (ou rode `termux-wake-lock` no terminal).
   * Nas configurações do Android, desative a otimização de bateria para o aplicativo Termux.

---

## 📥 Passo 2: Clonar ou Transferir o Harmony Music para o Celular

```bash
# Clone o repositório no Termux
git clone https://github.com/seu-usuario/harmony-music.git
cd harmony-music

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate

# Instale os requisitos
pip install -r requirements.txt
```

---

## 🚀 Passo 3: Iniciar o Servidor no Termux

```bash
./start.sh
```

O servidor iniciará escutando em todas as interfaces (`0.0.0.0:5050`).
* **No próprio celular:** abra `http://localhost:5050`
* **Em qualquer outro dispositivo na mesma rede Wi-Fi:** acesse `http://IP_DO_CELULAR:5050`

---

## ☁️ Passo 4: Criar URL Pública com Cloudflare Tunnel (Acesso Externo Seguro)

Você pode expor seu servidor para a internet com conexão criptografada (HTTPS) sem abrir portas no roteador de duas formas:

### Opção A: Túnel Rápido Instantâneo (Sem precisar de domínio próprio)
No Termux (em uma nova sessão ou segundo plano):
```bash
cloudflared tunnel --url http://localhost:5050
```
O Cloudflare gerará uma URL pública temporária (ex: `https://musica-random.trycloudflare.com`). Basta abrir esse link em qualquer lugar do mundo!

---

### Opção B: Túnel com Domínio Próprio (Recomendado para 24/7)
1. Conecte sua conta do Cloudflare:
   ```bash
   cloudflared tunnel login
   ```
2. Crie o túnel persistente:
   ```bash
   cloudflared tunnel create harmony-server
   ```
3. Aponte seu domínio/subdomínio para o túnel:
   ```bash
   cloudflared tunnel route dns harmony-server musica.seudominio.com
   ```
4. Crie o arquivo `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: harmony-server
   credentials-file: /data/data/com.termux/files/home/.cloudflared/harmony-server.json

   ingress:
     - hostname: musica.seudominio.com
       service: http://localhost:5050
     - service: http_status:404
   ```
5. Inicie o túnel em produção:
   ```bash
   cloudflared tunnel run harmony-server
   ```

Pronto! Agora você tem seu **próprio streaming de música estilo Spotify/YouTube Music rodando 24/7 no seu celular com acesso público mundial**! 🎵🌐

