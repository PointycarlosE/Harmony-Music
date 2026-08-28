import os
import re
import json
import requests
import urllib.parse
from bs4 import BeautifulSoup
from yt_dlp import YoutubeDL

def detect_platform(url: str) -> str:
    """Identifica a plataforma a partir do link."""
    u = url.lower()
    if "spotify.com" in u:
        return "spotify"
    if "youtube.com" in u or "youtu.be" in u or "music.youtube.com" in u:
        return "youtube"
    if "soundcloud.com" in u:
        return "soundcloud"
    if "bandcamp.com" in u:
        return "bandcamp"
    if "tiktok.com" in u:
        return "tiktok"
    if "instagram.com" in u:
        return "instagram"
    if "twitter.com" in u or "x.com" in u:
        return "twitter"
    return "universal"

def clean_spotify_url(url: str) -> tuple[str, str, str]:
    """
    Normaliza qualquer URL do Spotify (com /intl-pt/, query params, etc.)
    Retorna (media_type, media_id, clean_canonical_url).
    """
    match = re.search(r'(track|album|playlist)/([a-zA-Z0-9]+)', url)
    if match:
        media_type, media_id = match.group(1), match.group(2)
        return media_type, media_id, f"https://open.spotify.com/{media_type}/{media_id}"
    return "track", "", url

def get_spotify_collection_info(url: str) -> dict:
    """
    Extrai lista completa de faixas e metadados de Álbuns e Playlists do Spotify.
    """
    media_type, media_id, clean_url = clean_spotify_url(url)
    if not media_id or media_type not in ("album", "playlist"):
        return None

    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    embed_url = f"https://open.spotify.com/embed/{media_type}/{media_id}"
    
    try:
        res = requests.get(embed_url, headers=headers, timeout=6)
        if res.status_code != 200:
            return None

        soup = BeautifulSoup(res.text, "html.parser")
        next_data = soup.find("script", id="__NEXT_DATA__")
        if not next_data or not next_data.string:
            return None

        data = json.loads(next_data.string)
        entity = data.get("props", {}).get("pageProps", {}).get("state", {}).get("data", {}).get("entity", {})

        title = entity.get("title") or entity.get("name") or ("Álbum" if media_type == "album" else "Playlist")

        # Artista principal
        artist = "Vários Artistas"
        if "artists" in entity and entity["artists"]:
            artist = ", ".join([a.get("name", "") for a in entity["artists"] if a.get("name")])
        elif entity.get("artist"):
            artist = str(entity.get("artist"))
        elif entity.get("subtitle"):
            artist = str(entity.get("subtitle"))

        # Capa HD
        cover_url = ""
        images = entity.get("visualIdentity", {}).get("image", [])
        if images and isinstance(images, list):
            images.sort(key=lambda x: x.get("maxWidth", 0), reverse=True)
            if images[0].get("url"):
                cover_url = images[0]["url"]

        # Ano
        year = None
        if "releaseDate" in entity and isinstance(entity["releaseDate"], dict):
            iso_str = entity["releaseDate"].get("isoString", "")
            if iso_str and len(iso_str) >= 4 and iso_str[:4].isdigit():
                year = int(iso_str[:4])

        tracks = []
        track_list = entity.get("trackList", [])
        for idx, t in enumerate(track_list):
            t_title = t.get("title") or t.get("name")
            t_artist = t.get("subtitle") or artist
            t_uri = t.get("uri", "")
            t_id = t_uri.split(":")[-1] if t_uri else ""
            tracks.append({
                "title": t_title,
                "artist": t_artist,
                "album": title if media_type == "album" else (t.get("album") or title),
                "track_number": idx + 1,
                "id": t_id,
                "cover_url": cover_url,
                "year": year
            })

        return {
            "type": media_type,
            "title": title,
            "artist": artist,
            "cover_url": cover_url,
            "year": year,
            "total_tracks": len(tracks),
            "tracks": tracks
        }
    except Exception as e:
        print(f"[FormatInspector] Erro ao extrair coleção Spotify {url}: {e}")
        return None

def get_spotify_details(url: str) -> dict:
    """
    Extrai metadados completos e precisos (Título, Artista, Álbum Real, Número da Faixa, Ano e Capa HD) do Spotify.
    """
    media_type, media_id, clean_url = clean_spotify_url(url)
    
    # Se for Álbum ou Playlist
    if media_type in ("album", "playlist"):
        coll = get_spotify_collection_info(url)
        if coll:
            return {
                "title": coll["title"],
                "artist": coll["artist"],
                "album": coll["title"],
                "track_number": 1,
                "year": coll["year"],
                "thumbnail": coll["cover_url"],
                "is_playlist": True,
                "item_count": coll["total_tracks"],
                "duration": 0
            }

    details = {
        "title": "Música do Spotify",
        "artist": "Artista Desconhecido",
        "album": "",
        "track_number": 1,
        "year": None,
        "thumbnail": "",
        "is_playlist": False,
        "item_count": 1,
        "duration": 0
    }

    if not media_id:
        return details

    headers = {
        "User-Agent": "facebookexternalhit/1.1 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    }

    # 1. Raspagem da página canônica do Spotify
    try:
        res = requests.get(clean_url, headers=headers, timeout=6)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            
            # Título
            og_title = soup.find("meta", attrs={"property": "og:title"}) or soup.find("meta", attrs={"name": "twitter:title"})
            if og_title and og_title.get("content"):
                details["title"] = og_title["content"].strip()

            # Capa HD
            og_img = soup.find("meta", attrs={"property": "og:image"}) or soup.find("meta", attrs={"name": "twitter:image"})
            if og_img and og_img.get("content"):
                details["thumbnail"] = og_img["content"].strip()

            # Artista e Ano da descrição
            desc_tag = soup.find("meta", attrs={"name": "twitter:description"}) or soup.find("meta", attrs={"property": "og:description"})
            if desc_tag and desc_tag.get("content"):
                desc = desc_tag["content"].strip()
                parts = [p.strip() for p in desc.split("·")]
                if len(parts) >= 1 and parts[0]:
                    details["artist"] = parts[0]
                if len(parts) >= 2 and parts[1] and parts[1].lower() != "song":
                    details["album"] = parts[1]
                for p in parts:
                    if p.isdigit() and len(p) == 4:
                        details["year"] = int(p)

            # Artista description
            mus_desc = soup.find("meta", attrs={"property": "music:musician_description"}) or soup.find("meta", attrs={"name": "music:musician_description"})
            if mus_desc and mus_desc.get("content"):
                details["artist"] = mus_desc.get("content").strip()

            # Ano de lançamento
            rel_date = soup.find("meta", attrs={"property": "music:release_date"}) or soup.find("meta", attrs={"name": "music:release_date"})
            if rel_date and rel_date.get("content"):
                try:
                    details["year"] = int(rel_date["content"][:4])
                except Exception:
                    pass

            # Número da faixa no álbum
            tr_tag = soup.find("meta", attrs={"property": "music:album:track"}) or soup.find("meta", attrs={"name": "music:album:track"})
            if tr_tag and tr_tag.get("content"):
                try:
                    details["track_number"] = int(tr_tag["content"])
                except Exception:
                    pass

            # Link do Álbum -> Consulta o nome oficial do Álbum via oEmbed
            alb_tag = soup.find("meta", attrs={"name": "music:album"}) or soup.find("meta", attrs={"property": "music:album"})
            if alb_tag and alb_tag.get("content"):
                alb_url = alb_tag.get("content")
                try:
                    r_alb = requests.get(f"https://open.spotify.com/oembed?url={alb_url}", timeout=4)
                    if r_alb.status_code == 200:
                        album_official = r_alb.json().get("title")
                        if album_official:
                            details["album"] = album_official.strip()
                except Exception as e:
                    print(f"[FormatInspector] Aviso ao buscar nome do álbum no Spotify: {e}")

    except Exception as e:
        print(f"[FormatInspector] Scraper página Spotify aviso: {e}")

    # 2. Embed JSON como complemento / fallback
    if details["artist"] == "Artista Desconhecido" or not details["album"]:
        try:
            embed_url = f"https://open.spotify.com/embed/{media_type}/{media_id}"
            res = requests.get(embed_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, "html.parser")
                next_data = soup.find("script", id="__NEXT_DATA__")
                if next_data and next_data.string:
                    data = json.loads(next_data.string)
                    entity = data.get("props", {}).get("pageProps", {}).get("state", {}).get("data", {}).get("entity", {})
                    
                    if entity:
                        details["title"] = entity.get("title") or entity.get("name") or details["title"]
                        
                        if "artists" in entity and isinstance(entity["artists"], list) and entity["artists"]:
                            details["artist"] = ", ".join([a.get("name", "") for a in entity["artists"] if a.get("name")])
                        
                        if "album" in entity and isinstance(entity["album"], dict):
                            details["album"] = entity["album"].get("name", details["album"])

                        if entity.get("duration"):
                            details["duration"] = round(entity["duration"] / 1000.0, 1)

                        images = entity.get("visualIdentity", {}).get("image", [])
                        if images and isinstance(images, list):
                            images.sort(key=lambda x: x.get("maxWidth", 0), reverse=True)
                            if images[0].get("url") and not details["thumbnail"]:
                                details["thumbnail"] = images[0]["url"]
        except Exception as e:
            print(f"[FormatInspector] Embed Spotify aviso: {e}")

    if not details["album"]:
        details["album"] = f"{details['title']} - Single"

    return details

def inspect_url(url: str) -> dict:
    """
    Inspeciona uma URL antes do download para fornecer ao usuário a visualização
    de capa, título, artista, álbum, duração e seleção de qualidade (estilo Yoinks).
    """
    platform = detect_platform(url)
    result = {
        "url": url,
        "platform": platform,
        "title": "Mídia Desconhecida",
        "artist": "",
        "album": "",
        "thumbnail": "",
        "duration": 0,
        "is_playlist": False,
        "item_count": 1,
        "audio_formats": [
            {"id": "mp3-320", "label": "MP3 — 320 kbps (Alta Fidelidade)", "ext": "mp3", "quality": "320k", "default": True},
            {"id": "flac", "label": "FLAC — Lossless (Sem Perdas)", "ext": "flac", "quality": "lossless", "default": False},
            {"id": "m4a-256", "label": "M4A / AAC — 256 kbps", "ext": "m4a", "quality": "256k", "default": False}
        ],
        "video_formats": []
    }

    # 1. Tratamento específico Spotify
    if platform == "spotify":
        sp_data = get_spotify_details(url)
        result["title"] = sp_data["title"]
        result["artist"] = sp_data["artist"]
        result["album"] = sp_data["album"]
        result["thumbnail"] = sp_data["thumbnail"]
        result["duration"] = sp_data["duration"]
        result["is_playlist"] = sp_data["is_playlist"]
        result["item_count"] = sp_data.get("item_count", 1)
        return result

    # 2. Tratamento para YouTube e outras plataformas universais
    try:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "extract_flat": "in_playlist",
            "extractor_args": {
                "youtube": {
                    "player_client": ["ios", "android", "web"]
                }
            }
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                return result

            if "_type" in info and info["_type"] == "playlist":
                result["is_playlist"] = True
                result["title"] = info.get("title", "Playlist")
                result["artist"] = info.get("uploader", "YouTube")
                entries = info.get("entries") or []
                result["item_count"] = len(entries)
                if entries and len(entries) > 0 and entries[0]:
                    result["thumbnail"] = entries[0].get("thumbnail") or entries[0].get("thumbnails", [{}])[-1].get("url", "")
            else:
                result["title"] = info.get("title", "Mídia")
                result["artist"] = info.get("uploader") or info.get("artist") or info.get("channel") or ""
                result["album"] = info.get("album") or "Downloads"
                result["thumbnail"] = info.get("thumbnail") or ""
                result["duration"] = info.get("duration") or 0

                raw_formats = info.get("formats", [])
                seen_res = set()
                video_list = []

                for f in raw_formats:
                    height = f.get("height")
                    vcodec = f.get("vcodec")
                    if height and vcodec and vcodec != "none" and height not in seen_res:
                        seen_res.add(height)
                        filesize = f.get("filesize") or f.get("filesize_approx") or 0
                        size_mb = f"{round(filesize / (1024 * 1024), 1)} MB" if filesize > 0 else ""
                        
                        label = f"{height}p ({f.get('ext', 'mp4')})"
                        if size_mb:
                            label += f" ~ {size_mb}"
                            
                        video_list.append({
                            "id": f"video-{height}",
                            "format_id": f.get("format_id"),
                            "height": height,
                            "label": label,
                            "ext": "mp4",
                            "quality": f"{height}p"
                        })

                video_list.sort(key=lambda x: x["height"], reverse=True)
                result["video_formats"] = video_list

    except Exception as e:
        print(f"[FormatInspector] Erro ao inspecionar {url}: {e}")

    return result
