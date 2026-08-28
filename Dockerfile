FROM python:3.11-slim

# Instala FFmpeg e dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código da aplicação
COPY . .

# Expõe a porta padrão
EXPOSE 5050

# Volumes para persistência da biblioteca e banco de dados
VOLUME ["/app/library", "/app/data"]

# Executa o servidor
CMD ["python", "run.py", "--port", "5050", "--host", "0.0.0.0"]
