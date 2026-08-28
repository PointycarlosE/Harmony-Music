from flask import Blueprint, jsonify, request
from app.database import get_track_by_id, upsert_track
from app.core.lyrics import get_lyrics_for_track, fetch_online_lyrics, parse_lrc, save_lrc_file

lyrics_bp = Blueprint("lyrics", __name__)

@lyrics_bp.route("/api/lyrics/<int:track_id>", methods=["GET"])
def get_track_lyrics(track_id: int):
    """
    Retorna a letra da música (sincronizada com timestamps ou estática).
    Se não tiver letra local, busca automaticamente no LRCLIB e armazena.
    """
    track = get_track_by_id(track_id)
    if not track:
        return jsonify({"error": "Faixa não encontrada"}), 404

    lyrics_data = get_lyrics_for_track(
        filepath=track["filepath"],
        title=track["title"],
        artist=track["artist"],
        album=track.get("album", ""),
        duration=track.get("duration", 0),
        save_if_fetched=True
    )

    # Se encontrou nova letra, atualiza o status no banco
    if lyrics_data.get("has_lyrics") and not track["has_lyrics"]:
        track["has_lyrics"] = 1
        track["synced_lyrics"] = 1 if lyrics_data.get("is_synced") else 0
        upsert_track(track)

    return jsonify({
        "track_id": track_id,
        "title": track["title"],
        "artist": track["artist"],
        **lyrics_data
    })

@lyrics_bp.route("/api/lyrics/search", methods=["POST"])
def search_lyrics():
    """Busca manual de letras na API LRCLIB."""
    data = request.json or {}
    title = data.get("title", "").strip()
    artist = data.get("artist", "").strip()
    album = data.get("album", "").strip()

    if not title:
        return jsonify({"error": "Título é obrigatório"}), 400

    online_res = fetch_online_lyrics(title, artist, album)
    if not online_res:
        return jsonify({"found": False, "lyrics": None})

    parsed = parse_lrc(online_res["lrc"])
    return jsonify({
        "found": True,
        "source": online_res["source"],
        **parsed
    })

