@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  HARMONY MUSIC - Self-Hosted Music & Media Hub
echo ============================================================

REM 1. Cria .env se nao existir
if not exist .env (
    if exist .env.example (
        echo [INFO] Criando arquivo .env a partir do .env.example...
        copy .env.example .env >nul
    )
)

REM 2. Cria venv se nao existir
if not exist venv (
    echo [INFO] Criando ambiente virtual Python (venv)...
    python -m venv venv
)

call venv\Scripts\activate.bat

REM 3. Instala dependencias
python -c "import flask, waitress" 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Instalando dependencias do requirements.txt...
    pip install -r requirements.txt
)

REM 4. Inicia aplicacao
python run.py %*
pause

