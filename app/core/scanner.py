import os
import time
from pathlib import Path
from app.config import LIBRARY_DIR, SUPPORTED_AUDIO_EXTENSIONS
from app.database import get_db, upsert_track, get_track_by_filepath
from app.core.metadata import extract_metadata
from app.core.lyrics import get_lyrics_for_track

def cleanup_missing_tracks() -> int:
    """
    Verifica todas as músicas registradas no banco e remove aquelas
    cujos arquivos foram excluídos do disco.
    """
    removed_count = 0
    with get_db() as db:
        cur = db.execute("SELECT id, filepath FROM tracks")
        rows = cur.fetchall()
        for r in rows:
            fp = r["filepath"]
            if not fp or not os.path.exists(fp):
                db.execute("DELETE FROM tracks WHERE id = ?", (r["id"],))
                removed_count += 1
    if removed_count > 0:
        print(f"[Scanner] {removed_count} música(s) removida(s) do banco pois os arquivos não existem mais no disco.")
    return removed_count

def scan_file(filepath: str, fetch_missing_lyrics: bool = False) -> int:
    """
    Indexa um único arquivo de áudio no banco de dados.
    Retorna o ID da faixa no banco.
    """
    if not os.path.isfile(filepath):
        return None

    path_obj = Path(filepath)
    if path_obj.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
        return None

    meta = extract_metadata(filepath)
    if not meta:
        return None

    # Se a faixa não tiver letra marcada e o parâmetro pedir busca
    if fetch_missing_lyrics and not meta.get("has_lyrics"):
        lyrics_data = get_lyrics_for_track(
            filepath=filepath,
            title=meta["title"],
            artist=meta["artist"],
            album=meta["album"],
            duration=meta["duration"],
            save_if_fetched=True
        )
        if lyrics_data.get("has_lyrics"):
            meta["has_lyrics"] = 1
            meta["synced_lyrics"] = 1 if lyrics_data.get("is_synced") else 0

    track_id = upsert_track(meta)
    return track_id

def scan_directory(directory_path: str = None, fetch_missing_lyrics: bool = False) -> dict:
    """
    Varre um diretório recursivamente, indexa novas músicas e limpa faixas deletadas do disco.
    """
    target_dir = directory_path or LIBRARY_DIR
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    # 1. Limpa registros cujos arquivos físicos foram deletados
    removed = cleanup_missing_tracks()

    start_time = time.time()
    scanned_count = 0
    indexed_count = 0

    # 2. Varre diretórios de mídia
    pastas_para_varrer = [target_dir]
    base_proj = Path(__file__).resolve().parent.parent.parent
    for pasta_legada in ["spotify_downloads", "playlist_downloads"]:
        dir_legado = str(base_proj / pasta_legada)
        if os.path.exists(dir_legado) and dir_legado not in pastas_para_varrer:
            pastas_para_varrer.append(dir_legado)

    for p in pastas_para_varrer:
        for root, _, files in os.walk(p):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in SUPPORTED_AUDIO_EXTENSIONS:
                    scanned_count += 1
                    full_path = os.path.join(root, file)
                    try:
                        res = scan_file(full_path, fetch_missing_lyrics=fetch_missing_lyrics)
                        if res:
                            indexed_count += 1
                    except Exception as e:
                        print(f"[Scanner] Erro ao indexar {full_path}: {e}")

    elapsed = round(time.time() - start_time, 2)
    return {
        "scanned": scanned_count,
        "indexed": indexed_count,
        "removed": removed,
        "elapsed": elapsed
    }
