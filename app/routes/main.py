from flask import Blueprint, render_template

main_bp = Blueprint("main", __name__)

@main_bp.route("/", defaults={"path": ""})
@main_bp.route("/<path:path>")
def index(path):
    """
    Roteamento SPA: Qualquer rota do frontend (ex: /playlists, /tracks, /downloader)
    renderiza index.html, evitando erro 404 'Página não encontrada'.
    """
    return render_template("index.html")
