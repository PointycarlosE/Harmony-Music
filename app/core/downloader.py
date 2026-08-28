import os
import sys
import re
import uuid
import queue
import hashlib
import threading
import subprocess
import requests
import urllib.parse
from pathlib import Path
from yt_dlp import YoutubeDL
from app.config import LIBRARY_DIR, TEMP_DIR, COVERS_DIR, MAX_PARALLEL_DOWNLOADS, init_directories
from app.database import (
    upsert_download, get_download_by_id, find_existing_track,
    find_or_create_playlist, add_track_to_playlist, get_track_by_filepath
)
from app.core.format_inspector import detect_platform, inspect_url, get_spotify_details, get_spotify_collection_info, clean_spotify_url
from app.core.metadata import extract_metadata, embed_mp3_tags
from app.core.lyrics import get_lyrics_for_track, fetch_online_lyrics, save_lrc_file
from app.core.scanner import scan_file

init_directories()

event_listeners = []
event_lock = threading.Lock()

def add_event_listener():
    """Cria uma fila de eventos para um cliente SSE conectado."""
    q = queue.Queue(maxsize=100)
    with event_lock:
        event_listeners.append(q)
    return q

def remove_event_listener(q):
    """Remove a fila de eventos quando o cliente desconectar."""
    with event_lock:
        if q in event_listeners:
            event_listeners.remove(q)

def broadcast_event(event_type: str, data: dict):
    """Envia um evento JSON para todos os navegadores conectados."""
    msg = {"event": event_type, "data": data}
    with event_lock:
        for q in list(event_listeners):
            try:
                q.put_nowait(msg)
            except queue.Full:
                pass

def update_download_progress(task_id: str, url: str, **kwargs):
    """Atualiza o banco de dados e notifica os clientes conectados via SSE."""
    current = get_download_by_id(task_id) or {
        "id": task_id,
        "url": url,
        "title": kwargs.get("title", ""),
        "artist": kwargs.get("artist", ""),
        "thumbnail": kwargs.get("thumbnail", ""),
        "format_type": kwargs.get("format_type", "audio"),
        "quality": kwargs.get("quality", "320k"),
        "status": "pending",
        "progress": 0.0,
        "speed": "",
        "eta": "",
        "error_message": None
    }
    
    for k, v in kwargs.items():
        current[k] = v

    upsert_download(current)
    broadcast_event("download_progress", current)

def safe_filename(name: str) -> str:
    """Higieniza nomes de pastas e arquivos."""
    return re.sub(r'[\\/*?:"<>|]', "_", name).strip()[:100] or "download"

def download_single_audio_track(track_title: str, track_artist: str, track_album: str, track_number: int, year: int, thumbnail_url: str, download_dir: str) -> int:
    """
    Baixa uma faixa de áudio caso não exista, busca capa HD, letras e grava tags ID3 completas.
    Retorna o track_id no banco de dados.
    """
    track_prefix = f"{track_number:02d} - " if track_number else ""
    out_filename = safe_filename(f"{track_prefix}{track_title}")
    final_mp3 = os.path.join(download_dir, out_filename + ".mp3")

    # Se já existir no disco com tamanho válido, apenas re-indexa e retorna o ID
    if os.path.exists(final_mp3) and os.path.getsize(final_mp3) > 100000:
        return scan_file(final_mp3, fetch_missing_lyrics=True)

    out_template = os.path.join(download_dir, out_filename + ".%(ext)s")
    search_query = f"ytsearch1:{track_artist} {track_title}"

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_template,
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {
                "player_client": ["ios", "android", "web"]
            }
        },
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320"
            }
        ]
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([search_query])

    # Baixa capa HD
    cover_bytes = None
    if thumbnail_url:
        try:
            c_res = requests.get(thumbnail_url, timeout=6)
            if c_res.status_code == 200:
                cover_bytes = c_res.content
        except Exception:
            pass

    # Busca letras sincronizadas no LRCLIB
    lyrics_obj = fetch_online_lyrics(track_title, track_artist, track_album)
    lyrics_text = None
    if lyrics_obj and lyrics_obj.get("lrc"):
        save_lrc_file(final_mp3, lyrics_obj["lrc"])
        lyrics_text = lyrics_obj.get("plain") or lyrics_obj.get("lrc")

    # Embuti metadados completos
    track_id = None
    if os.path.exists(final_mp3):
        embed_mp3_tags(
            final_mp3,
            title=track_title,
            artist=track_artist,
            album=track_album,
            cover_bytes=cover_bytes,
            lyrics_text=lyrics_text,
            track_number=track_number,
            year=year
        )
        track_id = scan_file(final_mp3, fetch_missing_lyrics=True)

    return track_id

def download_youtube_or_universal(task_id: str, url: str, format_type: str = "audio", quality: str = "320k", title_hint: str = "", thumbnail_hint: str = ""):
    """
    Executa o download de vídeos ou áudios do YouTube e plataformas universais com yt-dlp.
    """
    update_download_progress(task_id, url, status="downloading", progress=10.0, title=title_hint or "Iniciando download...")

    download_dir = os.path.join(LIBRARY_DIR, "Downloads")
    os.makedirs(download_dir, exist_ok=True)

    def hook_progress(d):
        if d.get("status") == "downloading":
            info = d.get("info_dict", {})
            title = info.get("title", "") or title_hint
            pct_raw = d.get("_percent_str", "0%").replace("%", "").strip()
            try:
                pct = float(pct_raw)
            except ValueError:
                pct = 30.0
            
            speed_raw = d.get("_speed_str", "").strip()
            eta_raw = d.get("_eta_str", "").strip()

            update_download_progress(
                task_id, url,
                title=title,
                status="downloading",
                progress=round(pct, 1),
                speed=speed_raw,
                eta=eta_raw
            )
        elif d.get("status") == "finished":
            update_download_progress(task_id, url, status="processing", progress=90.0)

    if format_type == "video":
        res_height = quality.replace("p", "") if "p" in quality else "1080"
        ydl_opts = {
            "format": f"bestvideo[height<={res_height}]+bestaudio/best[height<={res_height}]/best",
            "outtmpl": os.path.join(download_dir, "%(title)s.%(ext)s"),
            "quiet": True,
            "no_warnings": True,
            "ignoreerrors": True,
            "progress_hooks": [hook_progress],
            "merge_output_format": "mp4",
            "extractor_args": {
                "youtube": {
                    "player_client": ["ios", "android", "web"]
                }
            }
        }
    else:
        codec = "mp3"
        if "flac" in quality.lower():
            codec = "flac"
        elif "m4a" in quality.lower() or "aac" in quality.lower():
            codec = "m4a"

        bitrate = "320" if "320" in quality else ("256" if "256" in quality else "0")

        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": os.path.join(download_dir, "%(artist,uploader)s - %(title)s.%(ext)s"),
            "quiet": True,
            "no_warnings": True,
            "ignoreerrors": True,
            "concurrent_fragment_downloads": MAX_PARALLEL_DOWNLOADS,
            "extractor_args": {
                "youtube": {
                    "player_client": ["ios", "android", "web"]
                }
            },
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": codec,
                    "preferredquality": bitrate
                },
                {"key": "EmbedThumbnail"},
                {"key": "FFmpegMetadata"}
            ],
            "writethumbnail": True,
            "progress_hooks": [hook_progress]
        }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            if not info:
                raise Exception("Não foi possível extrair os dados da mídia.")

        # Se for uma Playlist do YouTube, cria a playlist correspondente no sistema
        is_playlist = info.get("_type") == "playlist" or "entries" in info
        playlist_id = None
        if is_playlist:
            pl_name = info.get("title") or "Playlist do YouTube"
            playlist_id = find_or_create_playlist(pl_name, description="Importada do YouTube")

        scanned = []
        for root, _, files in os.walk(download_dir):
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in (".mp3", ".flac", ".m4a", ".ogg", ".opus"):
                    full_p = os.path.join(root, f)
                    track_id = scan_file(full_p, fetch_missing_lyrics=True)
                    if track_id:
                        scanned.append(full_p)
                        if playlist_id:
                            add_track_to_playlist(playlist_id, track_id)

        update_download_progress(
            task_id, url,
            status="completed",
            progress=100.0,
            speed="",
            eta=""
        )
        broadcast_event("library_updated", {"new_tracks": len(scanned)})

    except Exception as e:
        print(f"[Downloader] Erro no download {url}: {e}")
        update_download_progress(
            task_id, url,
            status="error",
            progress=0.0,
            error_message=str(e)
        )

def download_spotify(task_id: str, url: str, quality: str = "320k"):
    """
    Executa o download inteligente de Faixa Única, Álbum Completo ou Playlist do Spotify.
    Se a faixa já existir na biblioteca, apenas associa à playlist sem baixar novamente!
    """
    update_download_progress(task_id, url, status="downloading", progress=5.0, title="Identificando link no Spotify...")

    media_type, media_id, clean_url = clean_spotify_url(url)
    
    # 1. Álbum Completo ou Playlist do Spotify
    if media_type in ("album", "playlist"):
        try:
            coll = get_spotify_collection_info(url)
            if not coll or not coll.get("tracks"):
                raise Exception("Não foi possível extrair a lista de faixas do álbum/playlist.")

            coll_title = coll["title"]
            coll_artist = coll["artist"]
            coll_cover = coll["cover_url"]
            coll_year = coll["year"]
            total_tracks = coll["total_tracks"]

            is_user_playlist = (media_type == "playlist")
            target_playlist_id = None
            if is_user_playlist:
                target_playlist_id = find_or_create_playlist(
                    name=coll_title,
                    description=f"Playlist importada do Spotify ({total_tracks} faixas)"
                )

            artist_safe = safe_filename(coll_artist)
            album_safe = safe_filename(coll_title)
            download_dir = os.path.join(LIBRARY_DIR, "Spotify", artist_safe, album_safe)
            os.makedirs(download_dir, exist_ok=True)

            update_download_progress(
                task_id, url,
                title=f"{coll_title} ({total_tracks} faixas)",
                artist=coll_artist,
                thumbnail=coll_cover,
                status="downloading",
                progress=10.0
            )

            for idx, t in enumerate(coll["tracks"]):
                t_title = t["title"]
                t_artist = t["artist"]
                t_album = t["album"]
                t_num = t["track_number"]
                
                pct = round(10.0 + ((idx / total_tracks) * 85.0), 1)

                # VERIFICAÇÃO INTELIGENTE DE MÚSICA EXISTENTE
                existing = find_existing_track(t_title, t_artist)
                if existing:
                    track_id = existing["id"]
                    update_download_progress(
                        task_id, url,
                        title=f"[{idx+1}/{total_tracks}] {t_artist} - {t_title} (Já existe na biblioteca)",
                        status="downloading",
                        progress=pct
                    )
                else:
                    update_download_progress(
                        task_id, url,
                        title=f"[{idx+1}/{total_tracks}] {t_artist} - {t_title}",
                        status="downloading",
                        progress=pct
                    )
                    try:
                        track_id = download_single_audio_track(
                            track_title=t_title,
                            track_artist=t_artist,
                            track_album=t_album,
                            track_number=t_num,
                            year=coll_year,
                            thumbnail_url=coll_cover,
                            download_dir=download_dir
                        )
                    except Exception as track_err:
                        print(f"[Downloader Spotify Collection] Erro na faixa {t_title}: {track_err}")
                        track_id = None

                # Se for Playlist, vincula a faixa à playlist local
                if is_user_playlist and target_playlist_id and track_id:
                    add_track_to_playlist(target_playlist_id, track_id)

                broadcast_event("library_updated", {"downloaded_track": t_title})

            update_download_progress(
                task_id, url,
                title=f"{coll_title} — Concluído ({total_tracks} faixas)",
                artist=coll_artist,
                status="completed",
                progress=100.0,
                speed="",
                eta=""
            )
            broadcast_event("library_updated", {"status": "completed"})
            return

        except Exception as e:
            print(f"[Downloader Spotify Collection] Erro: {e}")
            update_download_progress(
                task_id, url,
                status="error",
                progress=0.0,
                error_message=str(e)
            )
            return

    # 2. Faixa Única do Spotify
    if media_type == "track":
        try:
            sp_meta = get_spotify_details(url)
            track_title = sp_meta.get("title", "Música")
            track_artist = sp_meta.get("artist", "Artista Desconhecido")
            track_album = sp_meta.get("album", "") or f"{track_title} - Single"
            track_number = sp_meta.get("track_number", 1)
            year = sp_meta.get("year")
            thumbnail_url = sp_meta.get("thumbnail", "")

            # Se já existir na biblioteca, não baixa de novo
            existing = find_existing_track(track_title, track_artist)
            if existing:
                update_download_progress(
                    task_id, url,
                    title=f"{track_artist} - {track_title} (Já existe na biblioteca)",
                    artist=track_artist,
                    status="completed",
                    progress=100.0,
                    speed="",
                    eta=""
                )
                broadcast_event("library_updated", {"status": "completed"})
                return

            artist_safe = safe_filename(track_artist)
            album_safe = safe_filename(track_album)
            download_dir = os.path.join(LIBRARY_DIR, "Spotify", artist_safe, album_safe)
            os.makedirs(download_dir, exist_ok=True)

            update_download_progress(
                task_id, url,
                title=f"{track_artist} - {track_title}",
                artist=track_artist,
                thumbnail=thumbnail_url,
                status="downloading",
                progress=25.0
            )

            download_single_audio_track(
                track_title=track_title,
                track_artist=track_artist,
                track_album=track_album,
                track_number=track_number,
                year=year,
                thumbnail_url=thumbnail_url,
                download_dir=download_dir
            )

            update_download_progress(
                task_id, url,
                title=f"{track_artist} - {track_title}",
                artist=track_artist,
                status="completed",
                progress=100.0,
                speed="",
                eta=""
            )
            broadcast_event("library_updated", {"status": "completed"})
            return

        except Exception as e:
            print(f"[Spotify Single Track] Erro no download direto: {e}")
            update_download_progress(
                task_id, url,
                status="error",
                progress=0.0,
                error_message=str(e)
            )

def start_download_task(url: str, format_type: str = "audio", quality: str = "320k", title: str = "", thumbnail: str = "") -> str:
    """
    Inicia uma tarefa de download assíncrona em uma thread dedicada.
    """
    task_id = str(uuid.uuid4())[:8]
    platform = detect_platform(url)

    update_download_progress(
        task_id, url,
        title=title or f"Download ({platform})",
        thumbnail=thumbnail,
        format_type=format_type,
        quality=quality,
        status="pending",
        progress=0.0
    )

    if platform == "spotify":
        target_fn = download_spotify
        args = (task_id, url, quality)
    else:
        target_fn = download_youtube_or_universal
        args = (task_id, url, format_type, quality, title, thumbnail)

    thread = threading.Thread(target=target_fn, args=args, daemon=True)
    thread.start()

    return task_id
