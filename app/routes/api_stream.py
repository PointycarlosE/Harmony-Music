import os
import re
from flask import Blueprint, Response, request, abort, send_from_directory
from app.database import get_track_by_id, increment_play_count
from app.config import COVERS_DIR

stream_bp = Blueprint("stream", __name__)

MIME_TYPES = {
    "mp3": "audio/mpeg",
    "flac": "audio/flac",
    "m4a": "audio/mp4",
    "aac": "audio/aac",
    "ogg": "audio/ogg",
    "opus": "audio/opus",
    "wav": "audio/wav",
    "mp4": "video/mp4"
}

@stream_bp.route("/api/stream/<int:track_id>")
def stream_audio(track_id: int):
    """
    Endpoint de streaming de áudio com suporte a HTTP 206 Partial Content (Range Requests).
    Permite busca (seek) instantânea no player sem carregar a música inteira.
    """
    track = get_track_by_id(track_id)
    if not track or not track["filepath"] or not os.path.isfile(track["filepath"]):
        abort(404, description="Arquivo de áudio não encontrado.")

    filepath = track["filepath"]
    file_size = os.path.getsize(filepath)
    ext = track["format"].lower() if track.get("format") else "mp3"
    content_type = MIME_TYPES.get(ext, "audio/mpeg")

    range_header = request.headers.get("Range", None)
    
    if not range_header:
        # Se for início da música sem Range, conta reprodução
        increment_play_count(track_id)
        
        def generate():
            with open(filepath, "rb") as f:
                while chunk := f.read(64 * 1024):
                    yield chunk

        headers = {
            "Content-Type": content_type,
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes"
        }
        return Response(generate(), 200, headers=headers)

    # Trata Range Header (ex: "bytes=1000-")
    match = re.search(r"bytes=(\d+)-(\d*)", range_header)
    if not match:
        abort(416, description="Range Header inválido")

    start = int(match.group(1))
    end = int(match.group(2)) if match.group(2) else file_size - 1

    if start >= file_size or end >= file_size:
        return Response(status=416, headers={"Content-Range": f"bytes */{file_size}"})

    length = end - start + 1

    def generate_range():
        with open(filepath, "rb") as f:
            f.seek(start)
            bytes_left = length
            while bytes_left > 0:
                chunk_size = min(64 * 1024, bytes_left)
                data = f.read(chunk_size)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    headers = {
        "Content-Type": content_type,
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Content-Length": str(length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache"
    }

    return Response(generate_range(), 206, headers=headers)

@stream_bp.route("/api/covers/<cover_hash>")
def get_cover(cover_hash: str):
    """
    Serve a imagem de capa em alta velocidade a partir do cache local.
    """
    filename = f"{cover_hash}.jpg"
    cover_path = os.path.join(COVERS_DIR, filename)
    if not os.path.exists(cover_path):
        abort(404, description="Capa não encontrada")

    return send_from_directory(
        COVERS_DIR,
        filename,
        mimetype="image/jpeg",
        max_age=86400 * 30 # Cache de 30 dias no navegador
    )

