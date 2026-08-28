import os
import threading
from flask import Flask
from flask_cors import CORS
from app.config import init_directories, DEBUG
from app.database import init_db
from app.core.scanner import scan_directory

def create_app():
    """Cria e configura a instância do aplicativo Flask."""
    init_directories()
    init_db()

    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )
    
    CORS(app)

    # Registro de Blueprints
    from app.routes.main import main_bp
    from app.routes.api_stream import stream_bp
    from app.routes.api_library import library_bp
    from app.routes.api_lyrics import lyrics_bp
    from app.routes.api_downloader import downloader_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(stream_bp)
    app.register_blueprint(library_bp)
    app.register_blueprint(lyrics_bp)
    app.register_blueprint(downloader_bp)

    # Varredura inicial da biblioteca em background
    def initial_scan():
        scan_directory(fetch_missing_lyrics=False)

    threading.Thread(target=initial_scan, daemon=True).start()

    return app

