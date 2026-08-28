import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager
from app.config import DB_PATH

def get_db_connection():
    """Cria uma nova conexão SQLite com WAL mode e foreign keys ativadas."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    """Context manager para gerenciar transações e fechamento automático."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Inicializa as tabelas do banco de dados SQLite."""
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filepath TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT,
            album_artist TEXT,
            duration REAL DEFAULT 0,
            bitrate INTEGER,
            format TEXT,
            filesize INTEGER,
            year INTEGER,
            genre TEXT,
            track_number INTEGER,
            disc_number INTEGER DEFAULT 1,
            cover_hash TEXT,
            has_lyrics INTEGER DEFAULT 0,
            synced_lyrics INTEGER DEFAULT 0,
            is_favorite INTEGER DEFAULT 0,
            play_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            cover_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS playlist_tracks (
            playlist_id INTEGER NOT NULL,
            track_id INTEGER NOT NULL,
            position INTEGER NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (playlist_id, track_id),
            FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
            FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS lyrics_cache (
            track_id INTEGER PRIMARY KEY,
            plain_lyrics TEXT,
            synced_lyrics TEXT,
            source TEXT,
            fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS downloads (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            title TEXT,
            artist TEXT,
            thumbnail TEXT,
            format_type TEXT DEFAULT 'audio',
            quality TEXT DEFAULT '320k',
            status TEXT DEFAULT 'pending',
            progress REAL DEFAULT 0.0,
            speed TEXT,
            eta TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
        CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
        CREATE INDEX IF NOT EXISTS idx_tracks_favorite ON tracks(is_favorite);
        CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
        CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
        """)

# --- Track Operations ---

def upsert_track(track_data: dict) -> int:
    """Insere ou atualiza uma faixa na biblioteca."""
    with get_db() as db:
        cursor = db.execute("""
            INSERT INTO tracks (
                filepath, title, artist, album, album_artist, duration,
                bitrate, format, filesize, year, genre, track_number,
                cover_hash, has_lyrics, synced_lyrics, updated_at
            ) VALUES (
                :filepath, :title, :artist, :album, :album_artist, :duration,
                :bitrate, :format, :filesize, :year, :genre, :track_number,
                :cover_hash, :has_lyrics, :synced_lyrics, CURRENT_TIMESTAMP
            )
            ON CONFLICT(filepath) DO UPDATE SET
                title = excluded.title,
                artist = excluded.artist,
                album = excluded.album,
                album_artist = excluded.album_artist,
                duration = excluded.duration,
                bitrate = excluded.bitrate,
                format = excluded.format,
                filesize = excluded.filesize,
                year = excluded.year,
                genre = excluded.genre,
                track_number = excluded.track_number,
                cover_hash = COALESCE(excluded.cover_hash, tracks.cover_hash),
                has_lyrics = excluded.has_lyrics,
                synced_lyrics = excluded.synced_lyrics,
                updated_at = CURRENT_TIMESTAMP
        """, track_data)
        return cursor.lastrowid

def get_all_tracks(limit: int = 1000, offset: int = 0, sort_by: str = "title"):
    """Retorna todas as faixas ordenadas."""
    allowed_sorts = {
        "title": "title ASC",
        "artist": "artist ASC, album ASC, track_number ASC",
        "recent": "created_at DESC",
        "popular": "play_count DESC"
    }
    order_clause = allowed_sorts.get(sort_by, "title ASC")
    with get_db() as db:
        cur = db.execute(f"""
            SELECT * FROM tracks 
            ORDER BY {order_clause}
            LIMIT ? OFFSET ?
        """, (limit, offset))
        return [dict(row) for row in cur.fetchall()]

def get_track_by_id(track_id: int):
    """Busca uma faixa por ID."""
    with get_db() as db:
        cur = db.execute("SELECT * FROM tracks WHERE id = ?", (track_id,))
        row = cur.fetchone()
        return dict(row) if row else None

def get_track_by_filepath(filepath: str):
    """Busca uma faixa pelo caminho do arquivo."""
    with get_db() as db:
        cur = db.execute("SELECT * FROM tracks WHERE filepath = ?", (filepath,))
        row = cur.fetchone()
        return dict(row) if row else None

def find_existing_track(title: str, artist: str = "") -> dict:
    """Busca se uma faixa já existe na biblioteca por título e artista."""
    if not title:
        return None
    clean_t = title.strip()
    clean_a = artist.strip() if artist else ""
    with get_db() as db:
        if clean_a:
            cur = db.execute("""
                SELECT * FROM tracks 
                WHERE LOWER(title) = LOWER(?) AND (LOWER(artist) LIKE LOWER(?) OR LOWER(?) LIKE ('%' || LOWER(artist) || '%'))
                LIMIT 1
            """, (clean_t, f"%{clean_a}%", clean_a))
        else:
            cur = db.execute("""
                SELECT * FROM tracks 
                WHERE LOWER(title) = LOWER(?)
                LIMIT 1
            """, (clean_t,))
        row = cur.fetchone()
        return dict(row) if row else None

def search_library(query: str):
    """Busca faixas, álbuns, artistas e playlists correspondentes à busca."""
    q = f"%{query}%"
    with get_db() as db:
        # 1. Faixas
        cur = db.execute("""
            SELECT * FROM tracks 
            WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
            ORDER BY 
                CASE 
                    WHEN title LIKE ? THEN 1
                    WHEN artist LIKE ? THEN 2
                    ELSE 3
                END
            LIMIT 30
        """, (q, q, q, q, q))
        tracks = [dict(row) for row in cur.fetchall()]

        # 2. Álbuns
        cur = db.execute("""
            SELECT 
                album,
                COALESCE(album_artist, artist) as artist,
                cover_hash,
                COUNT(id) as track_count,
                SUM(duration) as total_duration,
                MAX(year) as year
            FROM tracks
            WHERE album IS NOT NULL AND album != '' AND (album LIKE ? OR artist LIKE ?)
            GROUP BY album
            ORDER BY album ASC
            LIMIT 15
        """, (q, q))
        albums = [dict(row) for row in cur.fetchall()]

        # 3. Artistas
        cur = db.execute("""
            SELECT 
                artist,
                COUNT(id) as track_count,
                COUNT(DISTINCT album) as album_count,
                cover_hash
            FROM tracks
            WHERE artist IS NOT NULL AND artist != '' AND artist LIKE ?
            GROUP BY artist
            ORDER BY track_count DESC
            LIMIT 15
        """, (q,))
        artists = [dict(row) for row in cur.fetchall()]

        # 4. Playlists
        cur = db.execute("""
            SELECT 
                p.id, p.name, p.description, p.cover_hash,
                COUNT(pt.track_id) as track_count
            FROM playlists p
            LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
            WHERE p.name LIKE ? OR p.description LIKE ?
            GROUP BY p.id
            ORDER BY p.name ASC
            LIMIT 15
        """, (q, q))
        playlists = [dict(row) for row in cur.fetchall()]

        return {
            "tracks": tracks,
            "albums": albums,
            "artists": artists,
            "playlists": playlists,
            "total": len(tracks) + len(albums) + len(artists) + len(playlists)
        }

def get_albums():
    """Retorna lista de álbuns únicos agrupados."""
    with get_db() as db:
        cur = db.execute("""
            SELECT 
                album,
                COALESCE(album_artist, artist) as artist,
                cover_hash,
                COUNT(id) as track_count,
                SUM(duration) as total_duration,
                MAX(year) as year
            FROM tracks
            WHERE album IS NOT NULL AND album != ''
            GROUP BY album
            ORDER BY album ASC
        """)
        return [dict(row) for row in cur.fetchall()]

def get_album_tracks(album_name: str, artist_name: str = None):
    """Retorna todas as faixas de um álbum."""
    with get_db() as db:
        cur = db.execute("""
            SELECT * FROM tracks 
            WHERE album = ?
            ORDER BY track_number ASC, title ASC
        """, (album_name,))
        return [dict(row) for row in cur.fetchall()]

def get_artists():
    """Retorna lista de artistas com contagem de faixas e álbuns."""
    with get_db() as db:
        cur = db.execute("""
            SELECT 
                artist,
                COUNT(id) as track_count,
                COUNT(DISTINCT album) as album_count,
                cover_hash
            FROM tracks
            WHERE artist IS NOT NULL AND artist != ''
            GROUP BY artist
            ORDER BY artist ASC
        """)
        return [dict(row) for row in cur.fetchall()]

def get_artist_tracks(artist_name: str):
    """Retorna todas as faixas de um artista."""
    with get_db() as db:
        cur = db.execute("""
            SELECT * FROM tracks 
            WHERE artist = ? OR album_artist = ? OR artist LIKE ?
            ORDER BY album ASC, track_number ASC, title ASC
        """, (artist_name, artist_name, f"%{artist_name}%"))
        return [dict(row) for row in cur.fetchall()]

def toggle_favorite(track_id: int) -> bool:
    """Alterna o status de favorito de uma faixa."""
    with get_db() as db:
        cur = db.execute("SELECT is_favorite FROM tracks WHERE id = ?", (track_id,))
        row = cur.fetchone()
        if not row:
            return False
        novo_status = 0 if row["is_favorite"] else 1
        db.execute("UPDATE tracks SET is_favorite = ? WHERE id = ?", (novo_status, track_id))
        return bool(novo_status)

def increment_play_count(track_id: int):
    """Incrementa o contador de reproduções da faixa."""
    with get_db() as db:
        db.execute("UPDATE tracks SET play_count = play_count + 1 WHERE id = ?", (track_id,))

def get_favorites():
    """Retorna todas as faixas favoritadas."""
    with get_db() as db:
        cur = db.execute("SELECT * FROM tracks WHERE is_favorite = 1 ORDER BY updated_at DESC")
        return [dict(row) for row in cur.fetchall()]

def delete_track(track_id: int) -> bool:
    """Remove uma faixa do banco de dados."""
    with get_db() as db:
        cur = db.execute("DELETE FROM tracks WHERE id = ?", (track_id,))
        return cur.rowcount > 0

# --- Playlist Operations ---

def create_playlist(name: str, description: str = "", cover_hash: str = "") -> int:
    """Cria uma nova playlist no banco de dados."""
    with get_db() as db:
        cur = db.execute("""
            INSERT INTO playlists (name, description, cover_hash)
            VALUES (?, ?, ?)
        """, (name.strip(), description.strip(), cover_hash or None))
        return cur.lastrowid

def get_all_playlists():
    """Retorna todas as playlists com contagem de faixas e duração total."""
    with get_db() as db:
        cur = db.execute("""
            SELECT 
                p.id,
                p.name,
                p.description,
                COALESCE(p.cover_hash, (
                    SELECT t.cover_hash FROM tracks t
                    JOIN playlist_tracks pt ON pt.track_id = t.id
                    WHERE pt.playlist_id = p.id AND t.cover_hash IS NOT NULL
                    ORDER BY pt.position ASC LIMIT 1
                )) as cover_hash,
                COUNT(pt.track_id) as track_count,
                COALESCE(SUM(t.duration), 0) as total_duration,
                p.created_at
            FROM playlists p
            LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
            LEFT JOIN tracks t ON t.id = pt.track_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        """)
        return [dict(row) for row in cur.fetchall()]

def get_playlist_by_id(playlist_id: int):
    """Busca os detalhes de uma playlist."""
    with get_db() as db:
        cur = db.execute("""
            SELECT 
                p.id,
                p.name,
                p.description,
                COALESCE(p.cover_hash, (
                    SELECT t.cover_hash FROM tracks t
                    JOIN playlist_tracks pt ON pt.track_id = t.id
                    WHERE pt.playlist_id = p.id AND t.cover_hash IS NOT NULL
                    ORDER BY pt.position ASC LIMIT 1
                )) as cover_hash,
                COUNT(pt.track_id) as track_count,
                COALESCE(SUM(t.duration), 0) as total_duration,
                p.created_at
            FROM playlists p
            LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
            LEFT JOIN tracks t ON t.id = pt.track_id
            WHERE p.id = ?
            GROUP BY p.id
        """, (playlist_id,))
        row = cur.fetchone()
        return dict(row) if row else None

def get_playlist_tracks(playlist_id: int):
    """Retorna as faixas ordenadas por posição em uma playlist."""
    with get_db() as db:
        cur = db.execute("""
            SELECT t.*, pt.position as playlist_position
            FROM tracks t
            JOIN playlist_tracks pt ON pt.track_id = t.id
            WHERE pt.playlist_id = ?
            ORDER BY pt.position ASC, pt.id ASC
        """, (playlist_id,))
        return [dict(row) for row in cur.fetchall()]

def add_track_to_playlist(playlist_id: int, track_id: int) -> bool:
    """Adiciona uma faixa a uma playlist mantendo a ordem correta."""
    with get_db() as db:
        cur_pos = db.execute("SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM playlist_tracks WHERE playlist_id = ?", (playlist_id,))
        next_pos = cur_pos.fetchone()["next_pos"]
        try:
            db.execute("""
                INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position)
                VALUES (?, ?, ?)
            """, (playlist_id, track_id, next_pos))
            return True
        except Exception as e:
            print(f"[Database] Erro ao adicionar faixa {track_id} à playlist {playlist_id}: {e}")
            return False

def remove_track_from_playlist(playlist_id: int, track_id: int) -> bool:
    """Remove uma faixa de uma playlist."""
    with get_db() as db:
        cur = db.execute("DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?", (playlist_id, track_id))
        return cur.rowcount > 0

def delete_playlist(playlist_id: int) -> bool:
    """Exclui uma playlist e suas associações."""
    with get_db() as db:
        cur = db.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
        return cur.rowcount > 0

def find_or_create_playlist(name: str, description: str = "", cover_hash: str = "") -> int:
    """Busca uma playlist por nome ou cria uma nova caso não exista."""
    with get_db() as db:
        cur = db.execute("SELECT id FROM playlists WHERE LOWER(name) = LOWER(?) LIMIT 1", (name.strip(),))
        row = cur.fetchone()
        if row:
            return row["id"]
        cur_ins = db.execute("INSERT INTO playlists (name, description, cover_hash) VALUES (?, ?, ?)", (name.strip(), description.strip(), cover_hash or None))
        return cur_ins.lastrowid

# --- Downloads Tracking Operations ---

def upsert_download(data: dict):
    """Insere ou atualiza o estado de um download."""
    with get_db() as db:
        db.execute("""
            INSERT INTO downloads (
                id, url, title, artist, thumbnail, format_type, quality, status, progress, speed, eta, error_message
            ) VALUES (
                :id, :url, :title, :artist, :thumbnail, :format_type, :quality, :status, :progress, :speed, :eta, :error_message
            )
            ON CONFLICT(id) DO UPDATE SET
                title = COALESCE(excluded.title, downloads.title),
                artist = COALESCE(excluded.artist, downloads.artist),
                thumbnail = COALESCE(excluded.thumbnail, downloads.thumbnail),
                status = excluded.status,
                progress = excluded.progress,
                speed = excluded.speed,
                eta = excluded.eta,
                error_message = excluded.error_message
        """, data)

def get_downloads(limit: int = 50):
    """Retorna o histórico e fila de downloads."""
    with get_db() as db:
        cur = db.execute("SELECT * FROM downloads ORDER BY created_at DESC LIMIT ?", (limit,))
        return [dict(row) for row in cur.fetchall()]

def get_download_by_id(download_id: str):
    """Retorna um download específico."""
    with get_db() as db:
        cur = db.execute("SELECT * FROM downloads WHERE id = ?", (download_id,))
        row = cur.fetchone()
        return dict(row) if row else None
