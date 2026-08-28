import os
import sys
import socket
import argparse
from app import create_app
from app.config import HOST, PORT, DEBUG, LIBRARY_DIR

def get_local_ip():
    """Descobre o IP local na rede para fácil acesso via smartphone/outro PC."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    parser = argparse.ArgumentParser(description="Harmony — Self-Hosted Music & Media Hub")
    parser.add_argument("--host", default=HOST, help=f"Host para escutar (padrão: {HOST})")
    parser.add_argument("--port", type=int, default=PORT, help=f"Porta HTTP (padrão: {PORT})")
    parser.add_argument("--debug", action="store_true", default=DEBUG, help="Modo de depuração")
    parser.add_argument("--library", help="Diretório da biblioteca de músicas")

    args = parser.parse_args()

    if args.library:
        os.environ["HARMONY_LIBRARY_DIR"] = os.path.abspath(args.library)

    app = create_app()
    local_ip = get_local_ip()

    print("\n" + "=" * 60)
    print(" 🎵 HARMONY MUSIC — Self-Hosted Music & Media Hub")
    print("=" * 60)
    print(f" 🏠 Local:    http://localhost:{args.port}")
    print(f" 📱 Na Rede:  http://{local_ip}:{args.port}")
    print(f" 📂 Músicas:  {os.environ.get('HARMONY_LIBRARY_DIR', LIBRARY_DIR)}")
    print("=" * 60 + "\n")

    if args.debug:
        app.run(host=args.host, port=args.port, debug=True)
    else:
        try:
            from waitress import serve
            print("🚀 Servidor Waitress iniciado com sucesso.")
            serve(app, host=args.host, port=args.port, threads=8)
        except ImportError:
            app.run(host=args.host, port=args.port, debug=False)

if __name__ == "__main__":
    main()
