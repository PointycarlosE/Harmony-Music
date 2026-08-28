import os
import re
from pathlib import Path
import requests
import urllib.parse
from mutagen import File
from mutagen.id3 import ID3, USLT, SYLT
from app.config import LRCLIB_API_URL

def clean_track_title(title: str) -> str:
    """Remove termos comuns de videoclipes e sufixos para melhorar a busca de letras."""
    patterns = [
        r'\s*\(official\s*(?:video|audio|music\s*video|lyric\s*video|hd|4k)?\)',
        r'\s*\[official\s*(?:video|audio|music\s*video|lyric\s*video|hd|4k)?\]',
        r'\s*\(clipe\s*oficial\)',
        r'\s*\[clipe\s*oficial\]',
        r'\s*\(vídeo\s*oficial\)',
        r'\s*\(audio\)',
        r'\s*\[audio\]',
        r'\s*\(remastered(?:\s*\d+)?\)',
        r'\s*\[remastered(?:\s*\d+)?\]',
        r'\s*\(ao\s*vivo\)',
        r'\s*\(live\)',
        r'\s*\|\s*.*$',
    ]
    cleaned = title
    for p in patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def parse_lrc(lrc_content: str) -> dict:
    """
    Analisa uma string no formato .lrc e retorna:
    - is_synced (bool)
    - lines (lista de dicts: [{'time': float_em_segundos, 'text': str}])
    - plain (texto puro sem timestamps)
    """
    if not lrc_content or not isinstance(lrc_content, str):
        return {"is_synced": False, "lines": [], "plain": ""}

    lines = []
    plain_lines = []
    is_synced = False
    
    timestamp_pattern = re.compile(r'\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]')

    for raw_line in lrc_content.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if re.match(r'\[[a-zA-Z]+:', line):
            continue

        matches = list(timestamp_pattern.finditer(line))
        if matches:
            is_synced = True
            text = timestamp_pattern.sub('', line).strip()
            
            for match in matches:
                minutes = int(match.group(1))
                seconds = int(match.group(2))
                millis_str = match.group(3) or "0"
                if len(millis_str) == 2:
                    millis = int(millis_str) * 10
                else:
                    millis = int(millis_str.ljust(3, '0')[:3])
                
                total_seconds = round(minutes * 60 + seconds + (millis / 1000.0), 3)
                lines.append({"time": total_seconds, "text": text})
                plain_lines.append(text)
        else:
            plain_lines.append(line)
            lines.append({"time": None, "text": line})

    if is_synced:
        lines = [item for item in lines if item["time"] is not None]
        lines.sort(key=lambda x: x["time"])

    return {
        "is_synced": is_synced,
        "lines": lines,
        "plain": "\n".join(plain_lines)
    }

def get_local_lrc_file(filepath: str) -> str:
    """Procura por arquivo .lrc com o mesmo nome na pasta da faixa."""
    if not filepath:
        return None
    path_obj = Path(filepath)
    lrc_path = path_obj.with_suffix(".lrc")
    if lrc_path.is_file():
        try:
            return lrc_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            pass
    return None

def get_embedded_lyrics(filepath: str) -> str:
    """Extrai letras salvas dentro das tags ID3 do arquivo."""
    if not filepath or not os.path.isfile(filepath):
        return None
    try:
        audio = File(filepath)
        if audio and hasattr(audio, "tags") and audio.tags:
            for tag_name in audio.tags.keys():
                if tag_name.startswith("USLT") or tag_name.startswith("SYLT"):
                    return str(audio.tags[tag_name].text)
            if "lyrics" in audio.tags:
                return "\n".join(audio.tags["lyrics"])
    except Exception as e:
        print(f"[Lyrics] Aviso ao ler tags embutidas: {e}")
    return None

def fetch_online_lyrics(title: str, artist: str, album: str = "", duration: float = 0.0) -> dict:
    """
    Consulta a API pública LRCLIB para obter letras sincronizadas.
    """
    cleaned_title = clean_track_title(title)
    cleaned_artist = artist if artist and artist.lower() not in ("desconhecido", "spotify", "youtube", "unknown") else ""

    headers = {"User-Agent": "HarmonyMusicHub/1.0 (https://github.com/PointycarlosE)"}

    # 1. Tentativa exata /get
    if cleaned_artist:
        try:
            params = {
                "track_name": cleaned_title,
                "artist_name": cleaned_artist
            }
            if album:
                params["album_name"] = album
            if duration > 0:
                params["duration"] = int(duration)

            res = requests.get(f"{LRCLIB_API_URL}/get", params=params, headers=headers, timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data.get("syncedLyrics"):
                    return {"source": "lrclib", "lrc": data["syncedLyrics"], "is_synced": True}
                elif data.get("plainLyrics"):
                    return {"source": "lrclib", "lrc": data["plainLyrics"], "is_synced": False}
        except Exception as e:
            print(f"[Lyrics] LRCLIB /get aviso: {e}")

    # 2. Tentativa por busca aberta /search
    try:
        query = f"{cleaned_artist} {cleaned_title}".strip()
        res = requests.get(f"{LRCLIB_API_URL}/search", params={"q": query}, headers=headers, timeout=5)
        if res.status_code == 200:
            results = res.json()
            if results and isinstance(results, list):
                # Primeiro tenta achar uma que tenha syncedLyrics
                for item in results:
                    if item.get("syncedLyrics"):
                        return {"source": "lrclib_search", "lrc": item["syncedLyrics"], "is_synced": True}
                # Se não, retorna a primeira com plainLyrics
                for item in results:
                    if item.get("plainLyrics"):
                        return {"source": "lrclib_search", "lrc": item["plainLyrics"], "is_synced": False}
    except Exception as e:
        print(f"[Lyrics] LRCLIB /search aviso: {e}")

    return None

def save_lrc_file(filepath: str, lrc_content: str) -> bool:
    """Salva a letra como arquivo .lrc ao lado do arquivo de áudio."""
    try:
        if not filepath:
            return False
        path_obj = Path(filepath)
        lrc_path = path_obj.with_suffix(".lrc")
        lrc_path.write_text(lrc_content, encoding="utf-8")
        return True
    except Exception as e:
        print(f"[Lyrics] Erro ao salvar .lrc em {filepath}: {e}")
        return False

def get_lyrics_for_track(filepath: str, title: str, artist: str, album: str = "", duration: float = 0.0, save_if_fetched: bool = True) -> dict:
    """
    Mecanismo completo de busca de letras:
    1. Arquivo .lrc local
    2. Tags embutidas
    3. Consulta LRCLIB (e salva .lrc se encontrar)
    """
    # 1. Arquivo local
    local_lrc = get_local_lrc_file(filepath)
    if local_lrc:
        parsed = parse_lrc(local_lrc)
        return {**parsed, "source": "local_file", "has_lyrics": True}

    # 2. Embutido no áudio
    embedded = get_embedded_lyrics(filepath)
    if embedded:
        parsed = parse_lrc(embedded)
        return {**parsed, "source": "embedded", "has_lyrics": True}

    # 3. Busca online
    online_res = fetch_online_lyrics(title, artist, album, duration)
    if online_res and online_res.get("lrc"):
        lrc_text = online_res["lrc"]
        if save_if_fetched and filepath:
            save_lrc_file(filepath, lrc_text)
        parsed = parse_lrc(lrc_text)
        return {**parsed, "source": online_res["source"], "has_lyrics": True}

    return {"is_synced": False, "lines": [], "plain": "", "has_lyrics": False, "source": None}
