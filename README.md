# 🎵 Harmony Music — Self-Hosted Music Streaming & Media Hub

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Termux](https://img.shields.io/badge/Termux-Android%20Server-000000?style=for-the-badge&logo=android&logoColor=white)](https://termux.dev)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](#)

**Harmony Music** é uma plataforma de streaming e gerenciamento de música auto-hospedada (*self-hosted*), projetada com foco em alta fidelidade de áudio, elegância visual e controle total dos seus dados. 

Combina a interface moderna do **Spotify** e **YouTube Music**, letras sincronizadas em tempo real estilo **Apple Music (Karaokê)**, downloads inteligentes sem duplicações e suporte completo para rodar em computadores, servidores dedicados, Docker e até em smartphones antigos com **Termux**!

</div>

---

## ✨ Destaques & Principais Recursos

### 1. 🎧 Player Web de Alta Performance
* **Visual Obsidian com Iluminação Ambiente:** Interface escura profunda com mesh radial e efeito *glassmorphism* translúcido.
* **Streaming Instantâneo com Seek Real:** Suporte a **HTTP 206 Partial Content** para avançar e retroceder instantaneamente sem engasgos ou recarregamentos.
* **Equalizador Animado:** Barras dançantes animadas na música em reprodução ativa.
* **Modos de Repetição Inteligentes:** Alterna entre *Desativado*, *Repetir Todas* e *Repetir Música Atual (1)*.
* **Atalho Global:** Pressione <kbd>Espaço</kbd> em qualquer tela para pausar/retomar a música.

---

### 2. 📱 Experiência Mobile Completa (Spotify Now Playing Style)
* **Tela Cheia Deslizante (*Slide-Up*):** Ao tocar no mini-player inferior no celular, sobe suavemente uma tela de reprodução completa.
* **Capa com Brilho Ambiente Dinâmico:** Fundo com iluminação suave extraída das cores da capa do álbum.
* **Card de Prévia da Letra Dinâmica:** Role para baixo no player mobile para ver as estrofes sendo cantadas ao vivo, com botão de expansão direta para o karaokê em tela cheia.
* **Mini-Player Otimizado:** Limpo e compacto para navegação no celular com barra de progresso no topo.

---

### 3. 🎤 Letras Sincronizadas (Karaokê Apple Music / Spotify)
* **Sincronização em Tempo Real:** A linha atual ganha destaque com brilho esmeralda e rolagem suave automática.
* **Clique para Pular (*Click-to-Seek*):** Toque em qualquer verso da letra para pular o áudio diretamente para aquele momento!
* **Busca Automática via LRCLIB:** Encontra e armazena letras sincronizadas `.lrc` na pasta da música de forma automática.
* **Edição e Atualização Fácil:** Botão para recarregar letras de fontes públicas a qualquer momento.

---

### 4. 🔍 Busca Global Instantânea Unificada
* **Pesquisa Universal em Tempo Real:** Digite qualquer termo e encontre simultaneamente:
  * 🎵 **Músicas / Faixas**
  * 💿 **Álbuns**
  * 👥 **Artistas**
  * 📋 **Playlists**
* **Etiquetas Coloridas por Categoria:** Identificação visual rápida de cada tipo de resultado (`[FAIXA]`, `[ÁLBUM]`, `[ARTISTA]`, `[PLAYLIST]`).
* **Ações Diretas:** Toque para reproduzir imediatamente, abrir detalhes do álbum/artista ou adicionar à fila.

---

### 5. 💾 Persistência Completa de Estado (F5 Resume)
* **Nunca Perca seu Ponto:** O Harmony Music salva e restaura no seu navegador exatamente a faixa atual, segundo exato, fila de reprodução, modo aleatório, repetição e volume após fechar o navegador ou dar <kbd>F5</kbd>.

---

### 6. ⚡ Central de Downloads Inteligente (Yoinks Style)
* **Inspeção Prévia:** Veja capa HD, título, artista real, álbum e duração antes de baixar.
* **Formatos de Áudio & Vídeo:**
  * **Áudio:** MP3 320 kbps (Alta Fidelidade), FLAC Lossless (Sem Perdas) ou M4A.
  * **Vídeo:** MP4 em 1080p, 720p, 480p, etc.
* **Download Inteligente de Playlists (Zero Duplicações):** Se uma música já existir na sua biblioteca, o sistema não gasta internet nem espaço em disco baixando de novo; apenas vincula a faixa existente à playlist local em milissegundos!
* **Mais de 1.800 Plataformas:** Spotify, YouTube, SoundCloud, Bandcamp, TikTok, Instagram e muito mais.

---

### 7. 📑 Playlists Locais & Menu de Contexto
* **Menu de Contexto Completo:** Clique com o botão direito (ou toque em `...`) em qualquer faixa para:
  * ▶ Tocar Agora
  * ⏭ Tocar a Seguir (*Play Next*)
  * ➕ Adicionar à Fila (*Queue*)
  * 📁 Adicionar à Playlist
  * ❤️ Favoritar / Desfavoritar
  * 💿 Ir para o Álbum
  * 🎤 Ir para o Artista
* **Painel da Fila (*Queue Drawer*):** Veja e gerencie sua fila de reprodução com facilidade no desktop e em tela cheia no mobile.

---

## 📋 Pré-requisitos

* **Python 3.10 ou superior**
* **FFmpeg** (utilizado para processamento e conversão de áudio de alta fidelidade)

### Como instalar o FFmpeg:
* **Linux (Ubuntu / Debian / Mint):**
  ```bash
  sudo apt update && sudo apt install ffmpeg -y
  ```
* **Linux (Fedora / RHEL):**
  ```bash
  sudo dnf install ffmpeg -y
  ```
* **Linux (Arch Linux):**
  ```bash
  sudo pacman -S ffmpeg
  ```
* **macOS (Homebrew):**
  ```bash
  brew install ffmpeg
  ```
* **Windows:**
  Abra o PowerShell e execute:
  ```powershell
  winget install Gyan.FFmpeg
  ```
  *(Ou baixe pelo site oficial [ffmpeg.org](https://ffmpeg.org/download.html) e adicione ao PATH).*

---

## 🚀 Como Executar o Projeto

### Opção 1: Linux ou macOS (Recomendado)

Utilize o script automatizado:

```bash
# Dá permissão de execução (apenas na primeira vez)
chmod +x start.sh

# Inicia o servidor
./start.sh
```

---

### Opção 2: Windows

Dê um **duplo clique no arquivo `start.bat`** ou execute via terminal:

```cmd
start.bat
```

---

### Opção 3: Docker & Docker Compose

Execute em qualquer servidor ou homelab com um único comando:

```bash
docker compose up -d
```

O serviço estará disponível em `http://localhost:5050` com volumes persistentes para sua pasta `library/` e `data/`.

---

### Opção 4: Execução Manual via Python

```bash
# 1. Cria e ativa o ambiente virtual
python3 -m venv venv
source venv/bin/activate  # No Windows: .\venv\Scripts\activate

# 2. Instala as dependências
pip install -r requirements.txt

# 3. Cria o arquivo de configuração .env
cp .env.example .env

# 4. Inicia o servidor
python3 run.py --port 5050
```

---

### Opção 5: Servidor no Celular Android (Termux + Cloudflare Tunnel)

Você pode transformar um celular Android antigo em um servidor de streaming 24/7 sem pagar nada por hospedagem!

Consulte o nosso guia completo dedicado:  
👉 **[Guia Completo: Servidor Termux & Cloudflare Tunnel](TERMUX_CLOUDFLARE_GUIDE.md)**

---

## 🌐 Como Acessar no Navegador

* **No seu computador:** [http://localhost:5050](http://localhost:5050)
* **No celular/tablet na mesma rede Wi-Fi:** `http://IP_DO_SEU_SERVIDOR:5050`  
  *(O IP local é exibido diretamente no terminal ao iniciar o servidor)*.

---

## ⚙️ Variáveis de Ambiente (`.env`)

Configure portas, diretórios e integrações personalizadas no arquivo `.env`:

```env
# --- Servidor e Rede ---
HARMONY_HOST=0.0.0.0
HARMONY_PORT=5050
HARMONY_DEBUG=false

# --- Diretórios de Armazenamento (Opcional) ---
# Deixe em branco para usar as pastas padrão do projeto (library/ e data/)
# HARMONY_DATA_DIR=/caminho/para/dados
# HARMONY_LIBRARY_DIR=/caminho/para/musicas

# --- Concorrência de Downloads ---
HARMONY_MAX_PARALLEL=3

# --- Credenciais Spotify Developer (OPCIONAL) ---
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

> [!NOTE]  
> **Zero-Config:** O Harmony Music funciona **100% de fábrica SEM precisar de chaves da API do Spotify**! Ele utiliza scrapers e oEmbed oficial para obter metadados e capas em alta resolução. Caso queira usar credenciais próprias de desenvolvedor, basta preencher as variáveis acima no `.env`.

---

## 📂 Estrutura do Código

```
downloader-playlist/
├── app/
│   ├── __init__.py            # Fábrica da aplicação Flask
│   ├── config.py              # Configurações de diretórios, portas e .env
│   ├── database.py            # Banco SQLite com WAL, queries e índices otimizados
│   ├── core/
│   │   ├── format_inspector.py# Inspetor de mídias (Yoinks style + scrapers)
│   │   ├── downloader.py      # Motor de downloads (yt-dlp) com SSE e deduplicação
│   │   ├── lyrics.py          # Parser .lrc e integração com LRCLIB
│   │   ├── metadata.py        # Leitura e gravação de tags ID3 completas e capas HD
│   │   └── scanner.py         # Scanner de arquivos locais com limpeza automática
│   ├── routes/
│   │   ├── api_stream.py      # Streaming de áudio HTTP 206 e cache de capas
│   │   ├── api_library.py     # Endpoints de faixas, álbuns, artistas, busca e playlists
│   │   ├── api_lyrics.py      # Endpoints de busca e sincronização de letras
│   │   ├── api_downloader.py  # Endpoints de inspeção, disparo e SSE de downloads
│   │   └── main.py            # Rota da interface Web SPA
│   ├── static/
│   │   ├── css/               # Estilização moderna (main.css)
│   │   ├── js/                # Player, letras, fila, busca e downloader
│   │   └── img/               # Capas padrão e ícones vetoriais
│   └── templates/
│       └── index.html         # Layout SPA completo responsivo
├── data/                      # Banco de dados SQLite, cache de capas e temporários
├── library/                   # Músicas organizadas por plataforma/artista/álbum
├── .env.example               # Modelo de configurações de ambiente
├── .gitignore                 # Arquivos ignorados no git
├── Dockerfile                 # Configuração de container Docker
├── docker-compose.yml         # Orquestração rápida de containers
├── requirements.txt           # Dependências Python
├── run.py                     # Entrypoint do servidor
├── start.sh                   # Script de inicialização rápida para Linux/macOS
└── start.bat                  # Script de inicialização rápida para Windows
```

---

## 🛠️ Referência da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/tracks` | Lista todas as músicas da biblioteca |
| `GET` | `/api/tracks/<id>` | Detalhes de uma faixa específica |
| `POST`| `/api/tracks/<id>/favorite` | Alterna status de favorito (curtida) |
| `GET` | `/api/albums` | Lista todos os álbuns agrupados |
| `GET` | `/api/albums/<nome>` | Retorna todas as faixas do álbum |
| `GET` | `/api/artists` | Lista todos os artistas |
| `GET` | `/api/artists/<nome>` | Retorna todas as faixas do artista |
| `GET` | `/api/playlists` | Lista todas as playlists locais |
| `POST`| `/api/playlists` | Cria uma nova playlist |
| `GET` | `/api/playlists/<id>` | Detalhes e faixas de uma playlist |
| `POST`| `/api/playlists/<id>/tracks`| Adiciona uma música à playlist |
| `DELETE`| `/api/playlists/<id>/tracks/<track_id>` | Remove música da playlist |
| `DELETE`| `/api/playlists/<id>` | Exclui uma playlist |
| `GET` | `/api/search?q=<query>` | Busca global em faixas, álbuns, artistas e playlists |
| `GET` | `/api/lyrics/<track_id>` | Obtém letra sincronizada da música |
| `POST`| `/api/lyrics/search` | Busca manual de letras na web |
| `POST`| `/api/downloader/inspect`| Inspeciona URL antes do download |
| `POST`| `/api/downloader/start` | Inicia tarefa de download assíncrono |
| `GET` | `/api/downloader/events` | Stream de eventos em tempo real (SSE) |
| `GET` | `/api/stream/<track_id>` | Streaming de áudio com suporte a HTTP 206 (Seek) |

---

## 🗺️ Roadmap & Próximos Passos

O Harmony Music está em constante evolução. Abaixo estão as principais melhorias e recursos planejados para as próximas versões:

### 📱 1. Aplicativo Mobile Nativo (Android & iOS)
- [ ] Aplicativo dedicado construído em **Flutter** / **React Native** / **Kotlin**.
- [ ] **Integração com a Central de Mídia do SO:** Controles nativos na tela de bloqueio e barra de notificações com capa em alta resolução (`MediaSession API` e `AudioFocus`).
- [ ] **Modo Offline:** Download de faixas para reprodução no celular mesmo sem conexão com o servidor.

### ⚡ 2. Suporte PWA (Progressive Web App)
- [ ] Adição de `manifest.json` e Service Workers para instalação direta como aplicativo em navegadores mobile (Chrome, Safari, Edge).
- [ ] Suporte a reprodução contínua em segundo plano no navegador móvel.

### 🎛️ 3. Equalizador de Áudio Paramétrico no Navegador
- [ ] Equalizador de 10 bandas utilizando a **Web Audio API**.
- [ ] Presets de áudio integrados (*Bass Boost*, *Vocal*, *Rock*, *Pop*, *Acústico*, *Flat*).

### 🌐 4. Transmissão & Cast (Chromecast, AirPlay & DLNA)
- [ ] Botão de transmissão direta para Smart TVs, Chromecast e caixas de som inteligentes na mesma rede Wi-Fi.

### 👥 5. Múltiplos Usuários & Autenticação
- [ ] Sistema de login e contas locais protegidas por senha ou JWT.
- [ ] Perfis individuais com histórico de reprodução, favoritos e playlists privadas/públicas.

### 📊 6. Estatísticas & Harmony Wrapped
- [ ] Painel de estatísticas com histórico de reprodução: músicas mais ouvidas, artistas preferidos e minutos totais tocados.
- [ ] Geração de resumo anual/mensal estilo *Spotify Wrapped*.

### 📻 7. Rádio Inteligente & Recomendações Locais
- [ ] Algoritmo de rádio infinita baseado nas músicas da sua própria biblioteca, recomendando faixas similares por gênero, artista e BPM.

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Se você tiver ideias de novos recursos, correções de bugs ou melhorias de interface:

1. Faça um **Fork** do projeto.
2. Crie uma Branch para sua feature (`git checkout -b feature/minha-feature`).
3. Faça o Commit das suas alterações (`git commit -m 'feat: adiciona minha feature'`).
4. Envie para o GitHub (`git push origin feature/minha-feature`).
5. Abra um **Pull Request**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Sinta-se livre para usar, modificar, aprender e compartilhar com amigos ou em seu homelab pessoal!

---

<div align="center">
Feito com 💚 para quem ama música e liberdade!
</div>
