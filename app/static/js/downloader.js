// --- Harmony Downloader Hub, SSE & Polling Progress Tracker ---

class DownloaderHub {
  constructor() {
    this.urlInput = document.getElementById("yoinksUrlInput");
    this.inspectBtn = document.getElementById("btnInspect");
    this.previewCard = document.getElementById("inspectPreviewCard");
    this.previewThumb = document.getElementById("previewThumb");
    this.previewTitle = document.getElementById("previewTitle");
    this.previewAuthor = document.getElementById("previewAuthor");
    this.audioTab = document.getElementById("tabAudio");
    this.videoTab = document.getElementById("tabVideo");
    this.qualitySelect = document.getElementById("qualitySelect");
    this.btnConfirmDownload = document.getElementById("btnConfirmDownload");
    this.downloadsQueueList = document.getElementById("downloadsQueueList");

    this.currentInspection = null;
    this.selectedFormatType = "audio";
    this.activeDownloads = new Map();
    this.pollingInterval = null;

    this.initEvents();
    this.initSSE();
    this.loadHistory();
    this.startPolling();
  }

  initEvents() {
    if (this.inspectBtn) {
      this.inspectBtn.addEventListener("click", () => this.handleInspect());
    }

    if (this.urlInput) {
      this.urlInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.handleInspect();
      });
    }

    if (this.audioTab) {
      this.audioTab.addEventListener("click", () => this.setFormatType("audio"));
    }

    if (this.videoTab) {
      this.videoTab.addEventListener("click", () => this.setFormatType("video"));
    }

    if (this.btnConfirmDownload) {
      this.btnConfirmDownload.addEventListener("click", () => this.startDownload());
    }
  }

  async handleInspect() {
    const url = this.urlInput.value.trim();
    if (!url) return;

    this.inspectBtn.disabled = true;
    this.inspectBtn.innerHTML = `<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width: 16px; height: 16px;"></i> <span>Inspecionando...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await fetch("/api/downloader/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error("Erro ao inspecionar link");
      const data = await res.json();
      this.currentInspection = data;
      this.renderInspection(data);
    } catch (e) {
      if (window.app) window.app.showToast("Não foi possível inspecionar o link. Verifique a URL.", "error");
      console.error(e);
    } finally {
      this.inspectBtn.disabled = false;
      this.inspectBtn.innerHTML = `<i data-lucide="search"></i> <span>Inspecionar</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderInspection(data) {
    if (!this.previewCard) return;

    this.previewThumb.src = data.thumbnail || "/static/img/default-cover.svg";
    this.previewTitle.textContent = data.title;
    this.previewAuthor.textContent = `${data.artist || "Artista Desconhecido"} • ${data.platform.toUpperCase()}`;

    if (!data.video_formats || data.video_formats.length === 0) {
      if (this.videoTab) this.videoTab.style.display = "none";
      this.setFormatType("audio");
    } else {
      if (this.videoTab) this.videoTab.style.display = "flex";
    }

    this.updateQualityOptions();
    this.previewCard.style.display = "block";
    if (window.lucide) window.lucide.createIcons();
  }

  setFormatType(type) {
    this.selectedFormatType = type;
    if (this.audioTab && this.videoTab) {
      this.audioTab.classList.toggle("active", type === "audio");
      this.videoTab.classList.toggle("active", type === "video");
    }
    this.updateQualityOptions();
  }

  updateQualityOptions() {
    if (!this.currentInspection || !this.qualitySelect) return;

    this.qualitySelect.innerHTML = "";
    const list = this.selectedFormatType === "audio" 
      ? this.currentInspection.audio_formats 
      : this.currentInspection.video_formats;

    if (list && list.length > 0) {
      list.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt.quality;
        optionEl.textContent = opt.label;
        if (opt.default) optionEl.selected = true;
        this.qualitySelect.appendChild(optionEl);
      });
    } else {
      const optionEl = document.createElement("option");
      optionEl.value = "320k";
      optionEl.textContent = "Qualidade Padrão";
      this.qualitySelect.appendChild(optionEl);
    }
  }

  async startDownload() {
    if (!this.currentInspection) return;

    const payload = {
      url: this.currentInspection.url,
      format_type: this.selectedFormatType,
      quality: this.qualitySelect.value,
      title: this.currentInspection.title,
      thumbnail: this.currentInspection.thumbnail
    };

    this.btnConfirmDownload.disabled = true;
    this.btnConfirmDownload.innerHTML = `<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width: 16px; height: 16px;"></i> <span>Iniciando...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await fetch("/api/downloader/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao iniciar download");
      const data = await res.json();

      this.previewCard.style.display = "none";
      this.urlInput.value = "";
      this.currentInspection = null;

      this.upsertDownloadCard({
        id: data.task_id,
        title: payload.title || "Baixando...",
        status: "pending",
        progress: 10.0,
        speed: "",
        eta: ""
      });

      if (window.app) window.app.showToast("Download iniciado!", "success");
      this.startPolling();

    } catch (e) {
      if (window.app) window.app.showToast("Erro ao iniciar download: " + e.message, "error");
    } finally {
      this.btnConfirmDownload.disabled = false;
      this.btnConfirmDownload.innerHTML = `<i data-lucide="arrow-down-to-line"></i> <span>Baixar Agora</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  initSSE() {
    try {
      const evtSource = new EventSource("/api/downloader/events");

      evtSource.onmessage = (e) => {
        try {
          const eventData = JSON.parse(e.data);
          if (eventData.event === "download_progress") {
            this.upsertDownloadCard(eventData.data);
          } else if (eventData.event === "library_updated") {
            if (window.app) {
              window.app.loadLibraryTracks();
              window.app.showToast("Música adicionada à biblioteca!", "success");
            }
          }
        } catch (err) {}
      };

      evtSource.onerror = (e) => {
        console.warn("[DownloaderHub] SSE reconectando...", e);
      };
    } catch (err) {
      console.warn("[DownloaderHub] SSE não suportado:", err);
    }
  }

  startPolling() {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(async () => {
      await this.loadHistory(false);
    }, 1500);
  }

  async loadHistory(clear = true) {
    try {
      const res = await fetch("/api/downloader/history");
      if (!res.ok) return;
      const data = await res.json();
      if (data.downloads && this.downloadsQueueList) {
        if (clear) this.downloadsQueueList.innerHTML = "";
        data.downloads.forEach(d => this.upsertDownloadCard(d));
      }
    } catch (e) {
      console.error("[DownloaderHub] Erro ao carregar histórico:", e);
    }
  }

  upsertDownloadCard(d) {
    if (!this.downloadsQueueList) return;

    let card = document.getElementById(`dl-${d.id}`);
    const isCompleted = d.status === "completed";
    const isError = d.status === "error";

    let statusText = `${d.progress || 0}%`;
    let statusIcon = `<i data-lucide="clock" style="width: 14px; height: 14px;"></i>`;

    if (isCompleted) {
      statusText = "Concluído";
      statusIcon = `<i data-lucide="check-circle" style="width: 14px; height: 14px; color: var(--accent-primary);"></i>`;
    } else if (isError) {
      statusText = `Erro: ${d.error_message || "Falha"}`;
      statusIcon = `<i data-lucide="alert-triangle" style="width: 14px; height: 14px; color: #ef4444;"></i>`;
    }

    if (d.speed) statusText += ` • ${d.speed}`;
    if (d.eta) statusText += ` • ETA: ${d.eta}`;

    if (!card) {
      card = document.createElement("div");
      card.id = `dl-${d.id}`;
      card.className = "download-item";
      this.downloadsQueueList.prepend(card);
    }

    card.innerHTML = `
      <div class="download-item-header">
        <div class="download-item-title-wrap">
          <i data-lucide="music-2" style="width: 15px; height: 15px; color: var(--accent-primary); flex-shrink: 0;"></i>
          <strong class="download-item-title">${d.title || "Download"}</strong>
        </div>
        <span class="download-item-status ${isCompleted ? 'status-success' : (isError ? 'status-error' : '')}">
          ${statusIcon}
          <span>${statusText}</span>
        </span>
      </div>
      <div class="download-progress-bar-bg">
        <div class="download-progress-bar-fill" style="width: ${d.progress || 0}%; ${isCompleted ? 'background: var(--accent-primary);' : (isError ? 'background: #ef4444;' : '')}"></div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}

window.downloaderHub = new DownloaderHub();
