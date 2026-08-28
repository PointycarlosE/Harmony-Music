import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Carrega variáveis do arquivo .env (caso exista)
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Diretórios de armazenamento
DATA_DIR = os.getenv("HARMONY_DATA_DIR", str(BASE_DIR / "data"))
LIBRARY_DIR = os.getenv("HARMONY_LIBRARY_DIR", str(BASE_DIR / "library"))
COVERS_DIR = os.path.join(DATA_DIR, "covers")
TEMP_DIR = os.path.join(DATA_DIR, "temp")
DB_PATH = os.path.join(DATA_DIR, "harmony.db")

# Servidor
HOST = os.getenv("HARMONY_HOST", "0.0.0.0")
PORT = int(os.getenv("HARMONY_PORT", 5050))
DEBUG = os.getenv("HARMONY_DEBUG", "false").lower() in ("true", "1", "yes")

# Configurações de Download
MAX_PARALLEL_DOWNLOADS = int(os.getenv("HARMONY_MAX_PARALLEL", 3))
DEFAULT_AUDIO_FORMAT = "mp3"
DEFAULT_AUDIO_BITRATE = "320k"

# Provedores de Letras
LRCLIB_API_URL = "https://lrclib.net/api"

# Opcional: Credenciais de Desenvolvedor do Spotify
# (O Harmony funciona automaticamente sem credenciais via web scraper & oEmbed.
# Caso queira usar sua própria API do Spotify Developer, configure no .env).
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")

# Extensões de áudio suportadas para scanner da biblioteca
SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".flac", ".m4a", ".aac", ".ogg", ".opus", ".wav"}
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm"}

def init_directories():
    """Garante que todos os diretórios necessários existam."""
    for d in [DATA_DIR, LIBRARY_DIR, COVERS_DIR, TEMP_DIR]:
        os.makedirs(d, exist_ok=True)
