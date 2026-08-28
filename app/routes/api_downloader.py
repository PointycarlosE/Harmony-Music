import json
import time
from flask import Blueprint, jsonify, request, Response
from app.core.format_inspector import inspect_url
from app.core.downloader import (
    start_download_task, add_event_listener, remove_event_listener
)
from app.database import get_downloads, get_download_by_id

downloader_bp = Blueprint("downloader", __name__)

@downloader_bp.route("/api/downloader/inspect", methods=["POST"])
def inspect():
    """
    Inspeciona uma URL antes de baixar (estilo Yoinks) para exibir capa,
    título e formatos de áudio/vídeo disponíveis.
    """
    data = request.json or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "URL não fornecida"}), 400

    info = inspect_url(url)
    return jsonify(info)

@downloader_bp.route("/api/downloader/start", methods=["POST"])
def start_download():
    """
    Inicia o download de uma mídia em segundo plano.
    """
    data = request.json or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "URL não fornecida"}), 400

    format_type = data.get("format_type", "audio")
    quality = data.get("quality", "320k")
    title = data.get("title", "")
    thumbnail = data.get("thumbnail", "")

    task_id = start_download_task(
        url=url,
        format_type=format_type,
        quality=quality,
        title=title,
        thumbnail=thumbnail
    )

    return jsonify({
        "task_id": task_id,
        "status": "started",
        "url": url
    })

@downloader_bp.route("/api/downloader/history", methods=["GET"])
def history():
    """Retorna o histórico recente de downloads."""
    downloads = get_downloads(limit=30)
    return jsonify({"downloads": downloads})

@downloader_bp.route("/api/downloader/events")
def sse_events():
    """
    Server-Sent Events (SSE) para enviar progresso de downloads e atualizações
    de biblioteca em tempo real para o navegador.
    """
    def event_stream():
        q = add_event_listener()
        try:
            # Envia ping inicial
            yield f"data: {json.dumps({'event': 'connected'})}\n\n"
            while True:
                try:
                    # Espera por eventos na fila (timeout de 25s para manter conexão viva)
                    msg = q.get(timeout=25.0)
                    yield f"data: {json.dumps(msg)}\n\n"
                except Exception:
                    # Envia heartbeat ping para não dar timeout no browser
                    yield f": ping\n\n"
        finally:
            remove_event_listener(q)

    return Response(
        event_stream(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

