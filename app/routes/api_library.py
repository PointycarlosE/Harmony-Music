import threading
from flask import Blueprint, jsonify, request
from app.database import (
    get_all_tracks, get_track_by_id, search_library,
    get_albums, get_album_tracks, get_artists, get_artist_tracks,
    toggle_favorite, get_favorites, delete_track,
    create_playlist, get_all_playlists, get_playlist_by_id, get_playlist_tracks,
    add_track_to_playlist, remove_track_from_playlist, delete_playlist
)
from app.core.scanner import scan_directory

library_bp = Blueprint("library", __name__)

# --- Tracks ---

@library_bp.route("/api/tracks", methods=["GET"])
def list_tracks():
    sort_by = request.args.get("sort", "title")
    limit = int(request.args.get("limit", 1000))
    offset = int(request.args.get("offset", 0))
    tracks = get_all_tracks(limit=limit, offset=offset, sort_by=sort_by)
    return jsonify({"tracks": tracks, "total": len(tracks)})

@library_bp.route("/api/tracks/<int:track_id>", methods=["GET"])
def get_track(track_id: int):
    track = get_track_by_id(track_id)
    if not track:
        return jsonify({"error": "Faixa não encontrada"}), 404
    return jsonify({"track": track})

@library_bp.route("/api/tracks/<int:track_id>/favorite", methods=["POST"])
def fav_track(track_id: int):
    is_fav = toggle_favorite(track_id)
    return jsonify({"id": track_id, "is_favorite": is_fav})

@library_bp.route("/api/tracks/<int:track_id>", methods=["DELETE"])
def remove_track(track_id: int):
    success = delete_track(track_id)
    return jsonify({"success": success})

# --- Albums ---

@library_bp.route("/api/albums", methods=["GET"])
def list_albums():
    albums = get_albums()
    return jsonify({"albums": albums})

@library_bp.route("/api/albums/<path:album_name>", methods=["GET"])
def list_album_tracks(album_name: str):
    artist = request.args.get("artist")
    tracks = get_album_tracks(album_name, artist)
    return jsonify({"album": album_name, "tracks": tracks})

# --- Artists ---

@library_bp.route("/api/artists", methods=["GET"])
def list_artists():
    artists = get_artists()
    return jsonify({"artists": artists})

@library_bp.route("/api/artists/<path:artist_name>", methods=["GET"])
def list_artist_tracks(artist_name: str):
    tracks = get_artist_tracks(artist_name)
    return jsonify({"artist": artist_name, "tracks": tracks})

# --- Playlists ---

@library_bp.route("/api/playlists", methods=["GET"])
def list_playlists():
    playlists = get_all_playlists()
    return jsonify({"playlists": playlists})

@library_bp.route("/api/playlists", methods=["POST"])
def new_playlist():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    if not name:
        return jsonify({"error": "O nome da playlist é obrigatório"}), 400
    
    playlist_id = create_playlist(name, description)
    return jsonify({"id": playlist_id, "name": name, "description": description}), 201

@library_bp.route("/api/playlists/<int:playlist_id>", methods=["GET"])
def get_playlist_details(playlist_id: int):
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        return jsonify({"error": "Playlist não encontrada"}), 404
    tracks = get_playlist_tracks(playlist_id)
    return jsonify({"playlist": playlist, "tracks": tracks})

@library_bp.route("/api/playlists/<int:playlist_id>", methods=["DELETE"])
def delete_user_playlist(playlist_id: int):
    success = delete_playlist(playlist_id)
    return jsonify({"success": success})

@library_bp.route("/api/playlists/<int:playlist_id>/tracks", methods=["POST"])
def add_track_to_user_playlist(playlist_id: int):
    data = request.get_json() or {}
    track_id = data.get("track_id")
    if not track_id:
        return jsonify({"error": "ID da faixa é obrigatório"}), 400
    
    success = add_track_to_playlist(playlist_id, track_id)
    return jsonify({"success": success})

@library_bp.route("/api/playlists/<int:playlist_id>/tracks/<int:track_id>", methods=["DELETE"])
def remove_track_from_user_playlist(playlist_id: int, track_id: int):
    success = remove_track_from_playlist(playlist_id, track_id)
    return jsonify({"success": success})

# --- Favorites & Search ---

@library_bp.route("/api/favorites", methods=["GET"])
def list_favorites():
    favs = get_favorites()
    return jsonify({"tracks": favs})

@library_bp.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"results": []})
    results = search_library(query)
    return jsonify({"query": query, "results": results})

@library_bp.route("/api/scan", methods=["POST"])
def trigger_scan():
    fetch_lyrics = request.json.get("fetch_lyrics", False) if request.is_json else False
    
    def background_scan():
        scan_directory(fetch_missing_lyrics=fetch_lyrics)

    thread = threading.Thread(target=background_scan, daemon=True)
    thread.start()
    return jsonify({"status": "scanning", "message": "Varredura iniciada em segundo plano."})
