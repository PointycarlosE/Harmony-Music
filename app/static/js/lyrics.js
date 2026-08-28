// --- Harmony Visualizador e Sincronizador de Letras ---

class LyricsViewer {
  constructor() {
    this.overlay = document.getElementById("lyricsOverlay");
    this.lyricsBody = document.getElementById("lyricsBody");
    this.backdropGlow = document.getElementById("lyricsBackdropGlow");
    this.headerTitle = document.getElementById("lyricsHeaderTitle");
    this.headerArtist = document.getElementById("lyricsHeaderArtist");
    this.headerCover = document.getElementById("lyricsHeaderCover");
    this.btnRefetch = document.getElementById("btnRefetchLyrics");
    this.btnLyricsToggle = document.getElementById("btnLyrics");
    
    this.currentTrackId = null;
    this.lines = [];
    this.isSynced = false;
    this.activeLineIndex = -1;
    this.isOpen = false;
    this.isUserScrolling = false;
    this.scrollTimeout = null;

    this.initEvents();
  }

  initEvents() {
    if (this.lyricsBody) {
      this.lyricsBody.addEventListener("wheel", () => this.handleUserScroll(), { passive: true });
      this.lyricsBody.addEventListener("touchmove", () => this.handleUserScroll(), { passive: true });
    }

    if (this.btnRefetch) {
      this.btnRefetch.addEventListener("click", () => {
        if (this.currentTrackId) {
          this.loadLyrics(this.currentTrackId, true);
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  handleUserScroll() {
    this.isUserScrolling = true;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
    }, 2500);
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.overlay) return;
    this.isOpen = true;
    this.overlay.classList.add("active");
    if (this.btnLyricsToggle) this.btnLyricsToggle.classList.add("active");
    
    const track = window.player.currentTrack;
    if (track) {
      this.updateTrackInfo(track);
      if (this.currentTrackId !== track.id) {
        this.loadLyrics(track.id);
      }
    }
  }

  close() {
    if (!this.overlay) return;
    this.isOpen = false;
    this.overlay.classList.remove("active");
    if (this.btnLyricsToggle) this.btnLyricsToggle.classList.remove("active");
  }

  updateTrackInfo(track) {
    if (this.headerTitle) this.headerTitle.textContent = track.title;
    if (this.headerArtist) this.headerArtist.textContent = track.artist;
    
    const coverUrl = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
    if (this.headerCover) this.headerCover.src = coverUrl;
    if (this.backdropGlow) {
      this.backdropGlow.style.backgroundImage = `url('${coverUrl}')`;
    }
  }

  async loadLyrics(trackId, forceSearch = false) {
    this.currentTrackId = trackId;
    this.lyricsBody.innerHTML = `
      <div class="lyrics-empty-state">
        <div style="font-size: 24px; animation: spin 1s linear infinite;"><i data-lucide="loader-2"></i></div>
        <div>Carregando letra sincronizada...</div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      let data = null;
      if (forceSearch && window.player.currentTrack) {
        const track = window.player.currentTrack;
        const resSearch = await fetch("/api/lyrics/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: track.title,
            artist: track.artist,
            album: track.album || ""
          })
        });
        if (resSearch.ok) data = await resSearch.json();
      }

      if (!data || !data.lines) {
        const res = await fetch(`/api/lyrics/${trackId}`);
        if (!res.ok) throw new Error("Não foi possível carregar as letras");
        data = await res.json();
      }

      if (!data.has_lyrics || (!data.lines && !data.plain)) {
        this.renderEmptyState();
        return;
      }

      this.isSynced = data.is_synced;
      this.lines = data.lines || [];
      this.renderLyrics();
    } catch (e) {
      console.error("[LyricsViewer] Erro:", e);
      this.renderEmptyState();
    }
  }

  renderEmptyState() {
    this.lyricsBody.innerHTML = `
      <div class="lyrics-empty-state">
        <div class="lyrics-empty-icon"><i data-lucide="music-4"></i></div>
        <div style="font-weight: 700; font-size: 19px; color: var(--text-primary);">Nenhuma letra encontrada</div>
        <div style="font-size: 14px; color: var(--text-muted); line-height: 1.5;">Não encontramos letras sincronizadas para esta música no momento.</div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  renderLyrics() {
    this.lyricsBody.innerHTML = "";
    this.activeLineIndex = -1;

    if (!this.lines || this.lines.length === 0) {
      this.renderEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();

    this.lines.forEach((item, idx) => {
      const lineEl = document.createElement("div");
      lineEl.className = "lyrics-line";
      lineEl.textContent = item.text || "♪";
      lineEl.dataset.index = idx;
      
      if (this.isSynced && item.time !== null) {
        lineEl.dataset.time = item.time;
        lineEl.addEventListener("click", () => {
          window.player.seek(item.time);
          this.highlightLine(idx, true);
        });
      }

      fragment.appendChild(lineEl);
    });

    this.lyricsBody.appendChild(fragment);

    if (this.isSynced && window.player.audio) {
      this.onTimeUpdate(window.player.audio.currentTime);
    } else {
      this.updateSnippet(0);
    }
  }

  onTimeUpdate(currentTime) {
    this.updateSnippet(currentTime);

    if (!this.isSynced || !this.lines || this.lines.length === 0) return;

    let activeIdx = -1;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].time !== null && this.lines[i].time <= currentTime) {
        activeIdx = i;
      } else {
        break;
      }
    }

    if (activeIdx !== this.activeLineIndex && activeIdx !== -1) {
      this.highlightLine(activeIdx, !this.isUserScrolling);
    }
  }

  updateSnippet(currentTime) {
    const snippetEl = document.getElementById("mnpLyricsSnippet");
    if (!snippetEl) return;

    if (!this.lines || this.lines.length === 0) {
      snippetEl.innerHTML = `<p class="mnp-snippet-empty">Nenhuma letra sincronizada disponível para esta faixa.</p>`;
      return;
    }

    if (!this.isSynced) {
      const plainLines = this.lines.slice(0, 3).map(l => `<p class="mnp-snippet-line">${l.text || l}</p>`).join("");
      snippetEl.innerHTML = plainLines;
      return;
    }

    let activeIdx = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].time !== null && this.lines[i].time <= currentTime) {
        activeIdx = i;
      } else {
        break;
      }
    }

    const start = Math.max(0, activeIdx - 1);
    const end = Math.min(this.lines.length, start + 3);
    const slice = this.lines.slice(start, end);

    snippetEl.innerHTML = slice.map((item, idx) => {
      const isCurrent = (start + idx) === activeIdx;
      return `<p class="mnp-snippet-line ${isCurrent ? 'active' : ''}">${item.text || '♪'}</p>`;
    }).join("");
  }

  highlightLine(idx, autoScroll = true) {
    const allLines = this.lyricsBody.querySelectorAll(".lyrics-line");
    if (this.activeLineIndex >= 0 && allLines[this.activeLineIndex]) {
      allLines[this.activeLineIndex].classList.remove("active");
    }

    this.activeLineIndex = idx;
    const targetEl = allLines[idx];
    if (targetEl) {
      targetEl.classList.add("active");

      if (autoScroll && this.isOpen) {
        const bodyHeight = this.lyricsBody.clientHeight;
        const lineOffset = targetEl.offsetTop;
        const targetScroll = lineOffset - (bodyHeight / 2) + (targetEl.clientHeight / 2);
        
        this.lyricsBody.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth"
        });
      }
    }
  }
}

window.lyricsViewer = new LyricsViewer();

