import os
import hashlib
from pathlib import Path
from PIL import Image
import io
import mutagen
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3, APIC, USLT, TIT2, TPE1, TALB, TDRC, TCON, TRCK
from mutagen.flac import FLAC, Picture
from mutagen.mp4 import MP4, MP4Cover
from mutagen.oggvorbis import OggVorbis
from app.config import COVERS_DIR, init_directories

init_directories()

def get_hash(data: bytes) -> str:
    """Gera um hash MD5 para os bytes da imagem de capa."""
    return hashlib.md5(data).hexdigest()

def save_cover_image(image_bytes: bytes) -> str:
    """Salva os bytes de imagem em cache e retorna o cover_hash."""
    try:
        cover_hash = get_hash(image_bytes)
        cover_path = os.path.join(COVERS_DIR, f"{cover_hash}.jpg")
        
        if not os.path.exists(cover_path):
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.thumbnail((600, 600), Image.Resampling.LANCZOS)
            img.save(cover_path, "JPEG", quality=88, optimize=True)
            
        return cover_hash
    except Exception as e:
        print(f"[Metadata] Erro ao salvar imagem de capa: {e}")
        return None

def extract_metadata(filepath: str) -> dict:
    """
    Extrai metadados completos de um arquivo de áudio e salva sua capa no cache.
    """
    if not os.path.isfile(filepath):
        return None

    path_obj = Path(filepath)
    ext = path_obj.suffix.lower()
    filesize = os.path.getsize(filepath)

    meta = {
        "filepath": os.path.abspath(filepath),
        "title": path_obj.stem,
        "artist": "Desconhecido",
        "album": "",
        "album_artist": "",
        "duration": 0.0,
        "bitrate": 0,
        "format": ext.replace(".", ""),
        "filesize": filesize,
        "year": None,
        "genre": "",
        "track_number": 0,
        "cover_hash": None,
        "has_lyrics": 0,
        "synced_lyrics": 0
    }

    try:
        audio = mutagen.File(filepath)
        if audio is None:
            return meta

        if hasattr(audio, "info") and audio.info:
            meta["duration"] = round(getattr(audio.info, "length", 0.0), 2)
            meta["bitrate"] = int(getattr(audio.info, "bitrate", 0) / 1000) if getattr(audio.info, "bitrate", 0) else 0

        # 1. MP3 / ID3
        if ext == ".mp3":
            if audio.tags:
                meta["title"] = str(audio.tags.get("TIT2", [meta["title"]])[0])
                meta["artist"] = str(audio.tags.get("TPE1", ["Desconhecido"])[0])
                meta["album"] = str(audio.tags.get("TALB", [""])[0])
                meta["album_artist"] = str(audio.tags.get("TPE2", [meta["artist"]])[0])
                meta["genre"] = str(audio.tags.get("TCON", [""])[0])
                
                # Ano
                year_tag = audio.tags.get("TDRC") or audio.tags.get("TYER")
                if year_tag:
                    try:
                        meta["year"] = int(str(year_tag[0])[:4])
                    except ValueError:
                        pass
                
                # Número da faixa
                trck_tag = audio.tags.get("TRCK")
                if trck_tag:
                    try:
                        meta["track_number"] = int(str(trck_tag[0]).split("/")[0])
                    except ValueError:
                        pass

                # Extrai Capa Embutida
                for tag_name in audio.tags.keys():
                    if tag_name.startswith("APIC"):
                        apic = audio.tags[tag_name]
                        if apic.data:
                            meta["cover_hash"] = save_cover_image(apic.data)
                            break

        # 2. FLAC
        elif ext == ".flac" and isinstance(audio, FLAC):
            meta["title"] = audio.get("title", [meta["title"]])[0]
            meta["artist"] = audio.get("artist", ["Desconhecido"])[0]
            meta["album"] = audio.get("album", [""])[0]
            meta["album_artist"] = audio.get("albumartist", [meta["artist"]])[0]
            meta["genre"] = audio.get("genre", [""])[0]
            if "date" in audio:
                try:
                    meta["year"] = int(str(audio["date"][0])[:4])
                except ValueError:
                    pass
            if "tracknumber" in audio:
                try:
                    meta["track_number"] = int(str(audio["tracknumber"][0]).split("/")[0])
                except ValueError:
                    pass
            if audio.pictures:
                meta["cover_hash"] = save_cover_image(audio.pictures[0].data)

        # 3. M4A / MP4
        elif ext in (".m4a", ".mp4", ".aac") and isinstance(audio, MP4):
            tags = audio.tags or {}
            meta["title"] = tags.get("\xa9nam", [meta["title"]])[0]
            meta["artist"] = tags.get("\xa9ART", ["Desconhecido"])[0]
            meta["album"] = tags.get("\xa9alb", [""])[0]
            meta["album_artist"] = tags.get("aART", [meta["artist"]])[0]
            meta["genre"] = tags.get("\xa9gen", [""])[0]
            if "\xa9day" in tags:
                try:
                    meta["year"] = int(str(tags["\xa9day"][0])[:4])
                except ValueError:
                    pass
            if "trkn" in tags:
                try:
                    meta["track_number"] = int(tags["trkn"][0][0])
                except Exception:
                    pass
            if "covr" in tags and tags["covr"]:
                meta["cover_hash"] = save_cover_image(bytes(tags["covr"][0]))

        # Verifica se já existe arquivo .lrc junto da música
        lrc_path = path_obj.with_suffix(".lrc")
        if lrc_path.is_file():
            meta["has_lyrics"] = 1
            meta["synced_lyrics"] = 1

    except Exception as e:
        print(f"[Metadata] Aviso ao ler tags de {filepath}: {e}")

    # Fallback de título/artista a partir do nome do arquivo se estiver genérico
    if meta["artist"] == "Desconhecido" and " - " in meta["title"]:
        parts = meta["title"].split(" - ", 1)
        meta["artist"] = parts[0].strip()
        meta["title"] = parts[1].strip()

    return meta

def embed_mp3_tags(filepath: str, title: str, artist: str, album: str = "", cover_bytes: bytes = None, lyrics_text: str = None, track_number: int = 0, year: int = None):
    """Grava metadados ID3 e imagem de capa diretamente no arquivo MP3."""
    try:
        try:
            tags = ID3(filepath)
        except Exception:
            tags = ID3()

        tags.add(TIT2(encoding=3, text=title))
        tags.add(TPE1(encoding=3, text=artist))
        if album:
            tags.add(TALB(encoding=3, text=album))
        if track_number > 0:
            tags.add(TRCK(encoding=3, text=str(track_number)))
        if year:
            tags.add(TDRC(encoding=3, text=str(year)))

        if cover_bytes:
            tags.delall("APIC")
            tags.add(
                APIC(
                    encoding=3,
                    mime="image/jpeg",
                    type=3,
                    desc="Cover",
                    data=cover_bytes
                )
            )

        if lyrics_text:
            tags.delall("USLT")
            tags.add(
                USLT(
                    encoding=3,
                    lang="eng",
                    desc="Lyrics",
                    text=lyrics_text
                )
            )

        tags.save(filepath, v2_version=3)
        return True
    except Exception as e:
        print(f"[Metadata] Erro ao gravar tags em {filepath}: {e}")
        return False
