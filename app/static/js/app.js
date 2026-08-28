// --- Harmony Music Application Router & UI Controller ---

class AppController {
  constructor() {
    this.currentView = "home";
    this.allTracks = [];
    this.allAlbums = [];
    this.allArtists = [];
    this.allPlaylists = [];
    this.currentAlbumTracks = [];
    this.currentArtistTracks = [];
    this.currentPlaylistTracks = [];
    this.currentViewingPlaylist = null;
    this.previousVolume = 0.8;
    this.selectedTrackForContext = null;
    this.isQueueOpen = false;
    
    // Elementos do Player Bar
    this.playerCover = document.getElementById("playerCover");
    this.playerTitle = document.getElementById("playerTitle");
    this.playerArtist = document.getElementById("playerArtist");
    this.btnPlayPause = document.getElementById("btnPlayPause");
    this.btnPrev = document.getElementById("btnPrev");
    this.btnNext = document.getElementById("btnNext");
    this.btnShuffle = document.getElementById("btnShuffle");
    this.btnRepeat = document.getElementById("btnRepeat");
    this.btnLyrics = document.getElementById("btnLyrics");
    this.btnQueueToggle = document.getElementById("btnQueueToggle");
    this.btnFavCurrent = document.getElementById("btnFavCurrent");
    this.btnMobilePlayPause = document.getElementById("btnMobilePlayPause");
    this.mobileProgressFill = document.getElementById("mobileProgressFill");
    this.playerTrackInfoContainer = document.getElementById("playerTrackInfoContainer");
    this.seekBar = document.getElementById("seekBar");
    this.timeCurrent = document.getElementById("timeCurrent");
    this.timeTotal = document.getElementById("timeTotal");
    this.volumeBar = document.getElementById("volumeBar");
    this.btnVolToggle = document.getElementById("btnVolToggle");
    this.volIcon = document.getElementById("volIcon");
    this.searchInput = document.getElementById("searchInput");
    this.btnSearchClear = document.getElementById("btnSearchClear");
    this.searchResultsContainer = document.getElementById("searchResultsContainer");
    this.searchHeaderTitle = document.getElementById("searchHeaderTitle");
    this.searchHeaderSubtitle = document.getElementById("searchHeaderSubtitle");
    this.previousViewBeforeSearch = "home";

    // Elementos da Tela Cheia Mobile Now Playing (Spotify Style)
    this.mobileNowPlaying = document.getElementById("mobileNowPlaying");
    this.mnpBackdropGlow = document.getElementById("mnpBackdropGlow");
    this.btnMnpClose = document.getElementById("btnMnpClose");
    this.btnMnpOptions = document.getElementById("btnMnpOptions");
    this.mnpCover = document.getElementById("mnpCover");
    this.mnpTitle = document.getElementById("mnpTitle");
    this.mnpArtist = document.getElementById("mnpArtist");
    this.btnMnpFav = document.getElementById("btnMnpFav");
    this.mnpFavIcon = document.getElementById("mnpFavIcon");
    this.mnpSeekBar = document.getElementById("mnpSeekBar");
    this.mnpTimeCurrent = document.getElementById("mnpTimeCurrent");
    this.mnpTimeTotal = document.getElementById("mnpTimeTotal");
    this.btnMnpShuffle = document.getElementById("btnMnpShuffle");
    this.btnMnpPrev = document.getElementById("btnMnpPrev");
    this.btnMnpPlayPause = document.getElementById("btnMnpPlayPause");
    this.mnpPlayIcon = document.getElementById("mnpPlayIcon");
    this.btnMnpNext = document.getElementById("btnMnpNext");
    this.btnMnpRepeat = document.getElementById("btnMnpRepeat");
    this.mnpRepeatIcon = document.getElementById("mnpRepeatIcon");
    this.btnMnpLyricsQuick = document.getElementById("btnMnpLyricsQuick");
    this.btnMnpQueue = document.getElementById("btnMnpQueue");
    this.mnpLyricsCard = document.getElementById("mnpLyricsCard");
    this.btnMnpExpandLyrics = document.getElementById("btnMnpExpandLyrics");
    this.mnpHeaderContext = document.getElementById("mnpHeaderContext");

    // Elementos de Detalhes
    this.btnBackAlbums = document.getElementById("btnBackToAlbums");
    this.btnBackArtists = document.getElementById("btnBackToArtists");
    this.btnBackPlaylists = document.getElementById("btnBackToPlaylists");
    this.btnPlayAlbumAll = document.getElementById("btnPlayAlbumAll");
    this.btnShuffleAlbum = document.getElementById("btnShuffleAlbum");
    this.btnPlayArtistAll = document.getElementById("btnPlayArtistAll");
    this.btnShuffleArtist = document.getElementById("btnShuffleArtist");
    this.btnPlayPlaylistAll = document.getElementById("btnPlayPlaylistAll");
    this.btnShufflePlaylist = document.getElementById("btnShufflePlaylist");
    this.btnDeletePlaylist = document.getElementById("btnDeletePlaylist");

    // Modais de Playlist
    this.modalCreatePlaylist = document.getElementById("modalCreatePlaylist");
    this.inputPlaylistName = document.getElementById("inputPlaylistName");
    this.inputPlaylistDesc = document.getElementById("inputPlaylistDesc");
    this.btnConfirmCreatePlaylist = document.getElementById("btnConfirmCreatePlaylist");
    this.btnCancelModalPlaylist = document.getElementById("btnCancelModalPlaylist");
    this.btnCloseModalPlaylist = document.getElementById("btnCloseModalPlaylist");
    this.btnOpenCreatePlaylistModal = document.getElementById("btnOpenCreatePlaylistModal");
    this.btnHomeCreatePlaylist = document.getElementById("btnHomeCreatePlaylist");

    this.modalAddToPlaylist = document.getElementById("modalAddToPlaylist");
    this.modalAddToPlaylistTrackName = document.getElementById("modalAddToPlaylistTrackName");
    this.modalPlaylistSelectList = document.getElementById("modalPlaylistSelectList");
    this.btnCancelModalAddToPlaylist = document.getElementById("btnCancelModalAddToPlaylist");
    this.btnCloseModalAddToPlaylist = document.getElementById("btnCloseModalAddToPlaylist");
    this.btnQuickCreateInAddModal = document.getElementById("btnQuickCreateInAddModal");

    // Menu de Contexto
    this.contextMenu = document.getElementById("customContextMenu");
    this.ctxCover = document.getElementById("ctxCover");
    this.ctxTitle = document.getElementById("ctxTitle");
    this.ctxArtist = document.getElementById("ctxArtist");
    this.ctxPlayNow = document.getElementById("ctxPlayNow");
    this.ctxPlayNext = document.getElementById("ctxPlayNext");
    this.ctxAddToQueue = document.getElementById("ctxAddToQueue");
    this.ctxAddToPlaylist = document.getElementById("ctxAddToPlaylist");
    this.ctxToggleFavorite = document.getElementById("ctxToggleFavorite");
    this.ctxFavIcon = document.getElementById("ctxFavIcon");
    this.ctxFavText = document.getElementById("ctxFavText");
    this.ctxGoToAlbum = document.getElementById("ctxGoToAlbum");
    this.ctxGoToArtist = document.getElementById("ctxGoToArtist");
    this.ctxViewLyrics = document.getElementById("ctxViewLyrics");

    // Gaveta da Fila
    this.queueDrawer = document.getElementById("queueDrawer");
    this.queueBody = document.getElementById("queueBody");
    this.btnCloseQueue = document.getElementById("btnCloseQueue");
    this.btnClearQueue = document.getElementById("btnClearQueue");

    this.initApp();
  }

  initApp() {
    this.updateGreeting();
    this.bindNavigation();
    this.bindPlayerControls();
    this.bindMobileNowPlaying();
    this.bindContextMenu();
    this.bindQueueDrawer();
    this.bindPlaylistModals();
    this.bindSearch();
    this.bindDetailActions();
    this.loadLibraryTracks();
    this.loadAlbums();
    this.loadArtists();
    this.loadPlaylists();

    // Hook do Player
    window.player.onTrackChange = (track) => this.onTrackChanged(track);
    window.player.onTimeUpdate = (currentTime, duration) => this.onTimeUpdated(currentTime, duration);
    window.player.onStateChange = (state) => this.onPlaybackStateChanged(state);
    window.player.onQueueChange = () => this.renderQueue();

    // Restaura estado salvo do Player (Música atual, Segundo exato, Fila, Shuffle, Repeat, Volume)
    window.player.restoreState();

    if (this.btnShuffle && window.player.isShuffle) {
      this.btnShuffle.classList.add("active");
    }
    if (this.btnRepeat && window.player.isRepeat) {
      this.btnRepeat.classList.add("active");
      if (window.player.isRepeat === "one") {
        this.btnRepeat.innerHTML = `<i data-lucide="repeat-1"></i>`;
      }
    }

    // Inicializa volume padrão ou salvo
    this.updateVolumeUI(window.player.volume);

    // Suporte a rotas diretas na URL ao carregar a página
    const pathSlug = window.location.pathname.replace(/^\/+/, "").split("/")[0];
    const validViews = ["home", "tracks", "downloader", "playlists", "albums", "artists", "favorites", "search"];
    const initialView = validViews.includes(pathSlug) ? pathSlug : "home";
    this.switchView(initialView, false);

    // Suporte aos botões voltar/avançar do navegador
    window.addEventListener("popstate", (e) => {
      const targetView = (e.state && e.state.view) || "home";
      this.switchView(targetView, false);
    });

    this.refreshIcons();
  }

  updateGreeting() {
    const greetingEl = document.getElementById("homeGreetingText");
    if (!greetingEl) return;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      greetingEl.textContent = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      greetingEl.textContent = "Boa tarde";
    } else {
      greetingEl.textContent = "Boa noite";
    }
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle-2' : (type === 'error' ? 'alert-circle' : 'info')}" style="width: 18px; height: 18px; color: ${type === 'success' ? 'var(--accent-primary)' : (type === 'error' ? '#ef4444' : 'var(--text-secondary)')};"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  bindNavigation() {
    document.querySelectorAll(".nav-item[data-view], .mobile-nav-item[data-view]").forEach(item => {
      item.addEventListener("click", () => {
        const viewName = item.dataset.view;
        this.switchView(viewName);
      });
    });

    const btnQuickDl = document.getElementById("btnQuickDownload");
    if (btnQuickDl) {
      btnQuickDl.addEventListener("click", () => this.switchView("downloader"));
    }

    const btnScan = document.getElementById("btnScanLibrary");
    if (btnScan) {
      btnScan.addEventListener("click", () => this.triggerLibraryScan());
    }
  }

  bindDetailActions() {
    if (this.btnBackAlbums) {
      this.btnBackAlbums.addEventListener("click", () => this.switchView("albums"));
    }
    if (this.btnBackArtists) {
      this.btnBackArtists.addEventListener("click", () => this.switchView("artists"));
    }
    if (this.btnBackPlaylists) {
      this.btnBackPlaylists.addEventListener("click", () => this.switchView("playlists"));
    }

    // Álbum
    if (this.btnPlayAlbumAll) {
      this.btnPlayAlbumAll.addEventListener("click", () => {
        if (this.currentAlbumTracks.length === 0) return;
        const isCurrentAlbumPlaying = window.player.isPlaying && this.currentAlbumTracks.some(t => t.id === window.player.currentTrack?.id);
        if (isCurrentAlbumPlaying) {
          window.player.togglePlay();
        } else {
          window.player.playTrack(this.currentAlbumTracks[0], this.currentAlbumTracks);
        }
      });
    }

    if (this.btnShuffleAlbum) {
      this.btnShuffleAlbum.addEventListener("click", () => {
        if (this.currentAlbumTracks.length > 0) {
          window.player.isShuffle = true;
          if (this.btnShuffle) this.btnShuffle.classList.add("active");
          const randIdx = Math.floor(Math.random() * this.currentAlbumTracks.length);
          window.player.playTrack(this.currentAlbumTracks[randIdx], this.currentAlbumTracks);
        }
      });
    }

    // Artista
    if (this.btnPlayArtistAll) {
      this.btnPlayArtistAll.addEventListener("click", () => {
        if (this.currentArtistTracks.length === 0) return;
        const isCurrentArtistPlaying = window.player.isPlaying && this.currentArtistTracks.some(t => t.id === window.player.currentTrack?.id);
        if (isCurrentArtistPlaying) {
          window.player.togglePlay();
        } else {
          window.player.playTrack(this.currentArtistTracks[0], this.currentArtistTracks);
        }
      });
    }

    if (this.btnShuffleArtist) {
      this.btnShuffleArtist.addEventListener("click", () => {
        if (this.currentArtistTracks.length > 0) {
          window.player.isShuffle = true;
          if (this.btnShuffle) this.btnShuffle.classList.add("active");
          const randIdx = Math.floor(Math.random() * this.currentArtistTracks.length);
          window.player.playTrack(this.currentArtistTracks[randIdx], this.currentArtistTracks);
        }
      });
    }

    // Playlist
    if (this.btnPlayPlaylistAll) {
      this.btnPlayPlaylistAll.addEventListener("click", () => {
        if (this.currentPlaylistTracks.length === 0) return;
        const isCurrentPlaylistPlaying = window.player.isPlaying && this.currentPlaylistTracks.some(t => t.id === window.player.currentTrack?.id);
        if (isCurrentPlaylistPlaying) {
          window.player.togglePlay();
        } else {
          window.player.playTrack(this.currentPlaylistTracks[0], this.currentPlaylistTracks);
        }
      });
    }

    if (this.btnShufflePlaylist) {
      this.btnShufflePlaylist.addEventListener("click", () => {
        if (this.currentPlaylistTracks.length > 0) {
          window.player.isShuffle = true;
          if (this.btnShuffle) this.btnShuffle.classList.add("active");
          const randIdx = Math.floor(Math.random() * this.currentPlaylistTracks.length);
          window.player.playTrack(this.currentPlaylistTracks[randIdx], this.currentPlaylistTracks);
        }
      });
    }

    if (this.btnDeletePlaylist) {
      this.btnDeletePlaylist.addEventListener("click", async () => {
        if (!this.currentViewingPlaylist) return;
        if (confirm(`Tem certeza de que deseja excluir a playlist "${this.currentViewingPlaylist.name}"?`)) {
          await fetch(`/api/playlists/${this.currentViewingPlaylist.id}`, { method: "DELETE" });
          this.showToast("Playlist excluída com sucesso", "success");
          this.switchView("playlists");
          this.loadPlaylists();
        }
      });
    }
  }

  switchView(viewName, updateUrl = true) {
    this.currentView = viewName;
    
    document.querySelectorAll(".nav-item[data-view]").forEach(nav => {
      nav.classList.toggle("active", nav.dataset.view === viewName);
    });

    document.querySelectorAll(".mobile-nav-item[data-view]").forEach(nav => {
      nav.classList.toggle("active", nav.dataset.view === viewName);
    });

    document.querySelectorAll(".view-container").forEach(view => {
      view.classList.toggle("active", view.id === `view-${viewName}`);
    });

    if (updateUrl && window.history && window.history.pushState) {
      const newPath = viewName === "home" ? "/" : `/${viewName}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ view: viewName }, "", newPath);
      }
    }

    if (viewName === "home") {
      this.updateGreeting();
      this.renderQuickAccessGrid();
      this.renderPlaylistsGrid(this.allPlaylists.slice(0, 6), "homePlaylistsGrid");
    }
    if (viewName === "playlists") this.loadPlaylists();
    if (viewName === "tracks") this.loadLibraryTracks();
    if (viewName === "albums") this.loadAlbums();
    if (viewName === "artists") this.loadArtists();
    if (viewName === "favorites") this.loadFavorites();

    this.refreshIcons();
  }

  bindPlayerControls() {
    if (this.btnPlayPause) {
      this.btnPlayPause.addEventListener("click", () => window.player.togglePlay());
    }

    if (this.btnMobilePlayPause) {
      this.btnMobilePlayPause.addEventListener("click", (e) => {
        e.stopPropagation();
        window.player.togglePlay();
      });
    }

    // No mobile, clicar no player abre a tela cheia estilo Spotify
    if (this.playerTrackInfoContainer) {
      this.playerTrackInfoContainer.addEventListener("click", () => {
        if (window.innerWidth <= 768 && window.player.currentTrack) {
          this.openMobileNowPlaying();
        }
      });
    }

    const mainPlayer = document.getElementById("mainPlayerBar");
    if (mainPlayer) {
      mainPlayer.addEventListener("click", (e) => {
        if (window.innerWidth <= 768 && window.player.currentTrack) {
          if (!e.target.closest("button") && !e.target.closest("input")) {
            this.openMobileNowPlaying();
          }
        }
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener("click", () => window.player.next());
    }
    if (this.btnPrev) {
      this.btnPrev.addEventListener("click", () => window.player.prev());
    }

    if (this.btnShuffle) {
      this.btnShuffle.addEventListener("click", () => {
        const active = window.player.toggleShuffle();
        this.btnShuffle.classList.toggle("active", active);
        if (this.btnMnpShuffle) this.btnMnpShuffle.classList.toggle("active", active);
      });
    }

    if (this.btnRepeat) {
      this.btnRepeat.addEventListener("click", () => {
        const mode = window.player.toggleRepeat();
        this.syncRepeatUI(mode);
      });
    }

    if (this.btnLyrics) {
      this.btnLyrics.addEventListener("click", () => window.lyricsViewer.toggle());
    }

    if (this.btnFavCurrent) {
      this.btnFavCurrent.addEventListener("click", () => this.toggleCurrentFavorite());
    }

    if (this.seekBar) {
      this.seekBar.addEventListener("input", (e) => {
        const pct = parseFloat(e.target.value);
        this.seekBar.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${pct}%, var(--bg-surface-hover) ${pct}%, var(--bg-surface-hover) 100%)`;
        window.player.seekPercent(pct);
      });
    }

    if (this.volumeBar) {
      this.volumeBar.addEventListener("input", (e) => {
        const vol = parseFloat(e.target.value) / 100;
        window.player.setVolume(vol);
        this.updateVolumeUI(vol);
      });
    }

    if (this.btnVolToggle) {
      this.btnVolToggle.addEventListener("click", () => {
        if (window.player.volume > 0.01) {
          this.previousVolume = window.player.volume;
          window.player.setVolume(0);
          this.updateVolumeUI(0);
        } else {
          const restored = this.previousVolume || 0.8;
          window.player.setVolume(restored);
          this.updateVolumeUI(restored);
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        window.player.togglePlay();
      }
    });
  }

  // --- Tela Cheia Mobile Now Playing (Spotify Mobile Style) ---

  bindMobileNowPlaying() {
    if (!this.mobileNowPlaying) return;

    if (this.btnMnpClose) {
      this.btnMnpClose.addEventListener("click", () => this.closeMobileNowPlaying());
    }

    if (this.btnMnpOptions) {
      this.btnMnpOptions.addEventListener("click", (e) => {
        if (window.player.currentTrack) {
          this.showContextMenu(e, window.player.currentTrack);
        }
      });
    }

    if (this.btnMnpFav) {
      this.btnMnpFav.addEventListener("click", () => this.toggleCurrentFavorite());
    }

    if (this.mnpSeekBar) {
      this.mnpSeekBar.addEventListener("input", (e) => {
        const pct = parseFloat(e.target.value);
        this.mnpSeekBar.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${pct}%, var(--bg-surface-hover) ${pct}%, var(--bg-surface-hover) 100%)`;
        window.player.seekPercent(pct);
      });
    }

    if (this.btnMnpShuffle) {
      this.btnMnpShuffle.addEventListener("click", () => {
        const active = window.player.toggleShuffle();
        this.btnShuffle?.classList.toggle("active", active);
        this.btnMnpShuffle.classList.toggle("active", active);
      });
    }

    if (this.btnMnpPrev) {
      this.btnMnpPrev.addEventListener("click", () => window.player.prev());
    }

    if (this.btnMnpPlayPause) {
      this.btnMnpPlayPause.addEventListener("click", () => window.player.togglePlay());
    }

    if (this.btnMnpNext) {
      this.btnMnpNext.addEventListener("click", () => window.player.next());
    }

    if (this.btnMnpRepeat) {
      this.btnMnpRepeat.addEventListener("click", () => {
        const mode = window.player.toggleRepeat();
        this.syncRepeatUI(mode);
      });
    }

    if (this.btnMnpLyricsQuick) {
      this.btnMnpLyricsQuick.addEventListener("click", () => window.lyricsViewer?.open());
    }

    if (this.btnMnpExpandLyrics) {
      this.btnMnpExpandLyrics.addEventListener("click", (e) => {
        e.stopPropagation();
        window.lyricsViewer?.open();
      });
    }

    if (this.mnpLyricsCard) {
      this.mnpLyricsCard.addEventListener("click", () => window.lyricsViewer?.open());
    }

    if (this.btnMnpQueue) {
      this.btnMnpQueue.addEventListener("click", () => {
        this.openQueueDrawer();
      });
    }

    // Deslizar para baixo no topo para fechar a tela cheia
    let startY = 0;
    const header = this.mobileNowPlaying.querySelector(".mnp-header");
    if (header) {
      header.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });

      header.addEventListener("touchend", (e) => {
        const endY = e.changedTouches[0].clientY;
        if (endY - startY > 60) {
          this.closeMobileNowPlaying();
        }
      }, { passive: true });
    }
  }

  openMobileNowPlaying() {
    if (!this.mobileNowPlaying || !window.player.currentTrack) return;
    this.mobileNowPlaying.classList.add("active");
    this.syncMobileNowPlaying(window.player.currentTrack);
  }

  closeMobileNowPlaying() {
    if (!this.mobileNowPlaying) return;
    this.mobileNowPlaying.classList.remove("active");
  }

  syncMobileNowPlaying(track) {
    if (!track) return;
    if (this.mnpTitle) this.mnpTitle.textContent = track.title;
    if (this.mnpArtist) this.mnpArtist.textContent = track.artist;
    const coverUrl = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
    if (this.mnpCover) this.mnpCover.src = coverUrl;
    if (this.mnpBackdropGlow) this.mnpBackdropGlow.style.backgroundImage = `url('${coverUrl}')`;

    if (this.btnMnpFav) {
      this.btnMnpFav.classList.toggle("active", Boolean(track.is_favorite));
      this.btnMnpFav.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #10b981; color: #10b981;' : ''}"></i>`;
    }

    if (this.mnpHeaderContext) {
      this.mnpHeaderContext.textContent = track.album || "Músicas da Biblioteca";
    }

    if (this.btnMnpShuffle) {
      this.btnMnpShuffle.classList.toggle("active", window.player.isShuffle);
    }

    this.syncRepeatUI(window.player.isRepeat);
    this.refreshIcons();
  }

  syncRepeatUI(mode) {
    const isAll = mode === "all";
    const isOne = mode === "one";
    const isActive = isAll || isOne;

    [this.btnRepeat, this.btnMnpRepeat].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle("active", isActive);
      btn.innerHTML = `<i data-lucide="${isOne ? 'repeat-1' : 'repeat'}"></i>`;
    });

    this.refreshIcons();
  }

  // --- Modais de Playlists ---

  bindPlaylistModals() {
    const openCreate = () => {
      if (this.modalCreatePlaylist) {
        this.modalCreatePlaylist.classList.add("active");
        if (this.inputPlaylistName) {
          this.inputPlaylistName.value = "";
          this.inputPlaylistName.focus();
        }
        if (this.inputPlaylistDesc) this.inputPlaylistDesc.value = "";
      }
    };

    const closeCreate = () => {
      if (this.modalCreatePlaylist) this.modalCreatePlaylist.classList.remove("active");
    };

    if (this.btnOpenCreatePlaylistModal) this.btnOpenCreatePlaylistModal.addEventListener("click", openCreate);
    if (this.btnHomeCreatePlaylist) this.btnHomeCreatePlaylist.addEventListener("click", openCreate);
    if (this.btnCancelModalPlaylist) this.btnCancelModalPlaylist.addEventListener("click", closeCreate);
    if (this.btnCloseModalPlaylist) this.btnCloseModalPlaylist.addEventListener("click", closeCreate);

    if (this.btnConfirmCreatePlaylist) {
      this.btnConfirmCreatePlaylist.addEventListener("click", async () => {
        const name = this.inputPlaylistName.value.trim();
        const desc = this.inputPlaylistDesc.value.trim();
        if (!name) {
          this.showToast("Informe um nome para a playlist", "error");
          return;
        }

        try {
          const res = await fetch("/api/playlists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description: desc })
          });
          if (res.ok) {
            const data = await res.json();
            this.showToast(`Playlist "${name}" criada com sucesso!`, "success");
            closeCreate();
            this.loadPlaylists();
            if (this.selectedTrackForContext) {
              await this.addTrackToPlaylist(data.id, this.selectedTrackForContext.id);
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    // Modal de Adicionar à Playlist
    const closeAddToPlaylist = () => {
      if (this.modalAddToPlaylist) this.modalAddToPlaylist.classList.remove("active");
    };

    if (this.btnCancelModalAddToPlaylist) this.btnCancelModalAddToPlaylist.addEventListener("click", closeAddToPlaylist);
    if (this.btnCloseModalAddToPlaylist) this.btnCloseModalAddToPlaylist.addEventListener("click", closeAddToPlaylist);
    if (this.btnQuickCreateInAddModal) {
      this.btnQuickCreateInAddModal.addEventListener("click", () => {
        closeAddToPlaylist();
        openCreate();
      });
    }
  }

  openAddToPlaylistModal(track) {
    if (!track || !this.modalAddToPlaylist) return;
    this.selectedTrackForContext = track;
    if (this.modalAddToPlaylistTrackName) {
      this.modalAddToPlaylistTrackName.textContent = `Adicionar "${track.title}" a uma playlist:`;
    }

    this.renderPlaylistSelectList(track);
    this.modalAddToPlaylist.classList.add("active");
  }

  renderPlaylistSelectList(track) {
    if (!this.modalPlaylistSelectList) return;
    this.modalPlaylistSelectList.innerHTML = "";

    if (this.allPlaylists.length === 0) {
      this.modalPlaylistSelectList.innerHTML = `
        <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">
          Nenhuma playlist criada ainda.<br>Clique em <b>Nova Playlist</b> abaixo para criar sua primeira!
        </div>
      `;
      return;
    }

    this.allPlaylists.forEach(pl => {
      const item = document.createElement("div");
      item.className = "playlist-select-item";
      const coverSrc = pl.cover_hash ? `/api/covers/${pl.cover_hash}` : "/static/img/default-cover.svg";

      item.innerHTML = `
        <img src="${coverSrc}" class="playlist-select-thumb" alt="Cover">
        <div>
          <div class="playlist-select-name">${pl.name}</div>
          <div class="playlist-select-count">${pl.track_count || 0} faixa(s)</div>
        </div>
      `;

      item.addEventListener("click", async () => {
        await this.addTrackToPlaylist(pl.id, track.id);
        if (this.modalAddToPlaylist) this.modalAddToPlaylist.classList.remove("active");
      });

      this.modalPlaylistSelectList.appendChild(item);
    });
  }

  async addTrackToPlaylist(playlistId, trackId) {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track_id: trackId })
      });
      if (res.ok) {
        this.showToast("Música adicionada à playlist!", "success");
        this.loadPlaylists();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- Menu de Contexto Customizado (Botão Direito) ---

  bindContextMenu() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#customContextMenu")) {
        this.hideContextMenu();
      }
    });

    document.addEventListener("scroll", () => this.hideContextMenu(), true);
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hideContextMenu();
    });

    if (this.ctxPlayNow) {
      this.ctxPlayNow.addEventListener("click", () => {
        if (this.selectedTrackForContext) {
          window.player.playTrack(this.selectedTrackForContext);
          this.hideContextMenu();
        }
      });
    }

    if (this.ctxPlayNext) {
      this.ctxPlayNext.addEventListener("click", () => {
        if (this.selectedTrackForContext) {
          window.player.playNext(this.selectedTrackForContext);
          this.showToast(`"${this.selectedTrackForContext.title}" tocará a seguir`, "success");
          this.hideContextMenu();
        }
      });
    }

    if (this.ctxAddToQueue) {
      this.ctxAddToQueue.addEventListener("click", () => {
        if (this.selectedTrackForContext) {
          window.player.addToQueue(this.selectedTrackForContext);
          this.showToast(`"${this.selectedTrackForContext.title}" adicionada à fila`, "success");
          this.hideContextMenu();
        }
      });
    }

    if (this.ctxAddToPlaylist) {
      this.ctxAddToPlaylist.addEventListener("click", () => {
        if (this.selectedTrackForContext) {
          this.hideContextMenu();
          this.openAddToPlaylistModal(this.selectedTrackForContext);
        }
      });
    }

    if (this.ctxToggleFavorite) {
      this.ctxToggleFavorite.addEventListener("click", async () => {
        if (!this.selectedTrackForContext) return;
        const track = this.selectedTrackForContext;
        const res = await fetch(`/api/tracks/${track.id}/favorite`, { method: "POST" });
        const d = await res.json();
        track.is_favorite = d.is_favorite ? 1 : 0;
        
        const favBtn = document.querySelector(`.btn-fav-table[data-id="${track.id}"]`);
        if (favBtn) {
          favBtn.classList.toggle("active", Boolean(track.is_favorite));
          favBtn.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
        }

        if (window.player.currentTrack && window.player.currentTrack.id === track.id) {
          window.player.currentTrack.is_favorite = track.is_favorite;
          if (this.btnFavCurrent) {
            this.btnFavCurrent.classList.toggle("active", Boolean(track.is_favorite));
            this.btnFavCurrent.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
          }
        }

        this.refreshIcons();
        this.showToast(track.is_favorite ? "Adicionado aos Favoritos" : "Removido dos Favoritos", "success");
        this.hideContextMenu();
      });
    }

    if (this.ctxGoToAlbum) {
      this.ctxGoToAlbum.addEventListener("click", () => {
        if (this.selectedTrackForContext && this.selectedTrackForContext.album) {
          this.openAlbumDetail({
            album: this.selectedTrackForContext.album,
            artist: this.selectedTrackForContext.artist,
            cover_hash: this.selectedTrackForContext.cover_hash,
            track_count: ""
          });
          this.hideContextMenu();
        }
      });
    }

    if (this.ctxGoToArtist) {
      this.ctxGoToArtist.addEventListener("click", () => {
        if (this.selectedTrackForContext && this.selectedTrackForContext.artist) {
          this.openArtistDetail({
            artist: this.selectedTrackForContext.artist,
            cover_hash: this.selectedTrackForContext.cover_hash,
            track_count: ""
          });
          this.hideContextMenu();
        }
      });
    }

    if (this.ctxViewLyrics) {
      this.ctxViewLyrics.addEventListener("click", () => {
        if (this.selectedTrackForContext) {
          if (!window.player.currentTrack || window.player.currentTrack.id !== this.selectedTrackForContext.id) {
            window.player.playTrack(this.selectedTrackForContext);
          }
          window.lyricsViewer.open();
          this.hideContextMenu();
        }
      });
    }
  }

  showContextMenu(e, track) {
    e.preventDefault();
    e.stopPropagation();

    this.selectedTrackForContext = track;
    if (!this.contextMenu) return;

    if (this.ctxCover) {
      this.ctxCover.src = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
    }
    if (this.ctxTitle) this.ctxTitle.textContent = track.title;
    if (this.ctxArtist) this.ctxArtist.textContent = track.artist;

    if (this.ctxFavText) {
      this.ctxFavText.textContent = track.is_favorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
    }
    if (this.ctxFavIcon) {
      this.ctxFavIcon.style.color = track.is_favorite ? "#ef4444" : "var(--text-secondary)";
      this.ctxFavIcon.style.fill = track.is_favorite ? "#ef4444" : "none";
    }

    this.contextMenu.style.display = "flex";

    const menuWidth = 240;
    const menuHeight = 350;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 16;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 16;
    }

    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;

    this.refreshIcons();
  }

  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = "none";
    }
  }

  // --- Gaveta da Fila de Reprodução ---

  bindQueueDrawer() {
    if (this.btnQueueToggle) {
      this.btnQueueToggle.addEventListener("click", () => this.toggleQueueDrawer());
    }

    if (this.btnCloseQueue) {
      this.btnCloseQueue.addEventListener("click", () => this.closeQueueDrawer());
    }

    if (this.btnClearQueue) {
      this.btnClearQueue.addEventListener("click", () => {
        window.player.clearQueue();
        this.showToast("Fila de reprodução limpa", "info");
      });
    }
  }

  toggleQueueDrawer() {
    if (this.isQueueOpen) {
      this.closeQueueDrawer();
    } else {
      this.openQueueDrawer();
    }
  }

  openQueueDrawer() {
    this.isQueueOpen = true;
    if (this.queueDrawer) this.queueDrawer.classList.add("active");
    if (this.btnQueueToggle) this.btnQueueToggle.classList.add("active");
    this.renderQueue();
  }

  closeQueueDrawer() {
    this.isQueueOpen = false;
    if (this.queueDrawer) this.queueDrawer.classList.remove("active");
    if (this.btnQueueToggle) this.btnQueueToggle.classList.remove("active");
  }

  renderQueue() {
    if (!this.queueBody) return;
    this.queueBody.innerHTML = "";

    const current = window.player.currentTrack;
    const upcoming = window.player.getUpcomingQueue();

    // 1. Tocando Agora
    const nowSection = document.createElement("div");
    nowSection.innerHTML = `<div class="queue-section-title">Tocando Agora</div>`;
    
    if (current) {
      const coverSrc = current.cover_hash ? `/api/covers/${current.cover_hash}` : "/static/img/default-cover.svg";
      const itemEl = document.createElement("div");
      itemEl.className = "queue-item current";
      itemEl.innerHTML = `
        <img src="${coverSrc}" class="queue-item-thumb" alt="Cover">
        <div class="queue-item-info">
          <span class="queue-item-title">${current.title}</span>
          <span class="queue-item-artist">${current.artist}</span>
        </div>
        <div class="equalizer-anim"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>
      `;
      nowSection.appendChild(itemEl);
    } else {
      nowSection.innerHTML += `<div style="color: var(--text-muted); font-size: 13px; padding: 10px;">Nenhuma música selecionada</div>`;
    }
    this.queueBody.appendChild(nowSection);

    // 2. A Seguir na Fila
    const nextSection = document.createElement("div");
    nextSection.innerHTML = `<div class="queue-section-title">A Seguir na Fila (${upcoming.length})</div>`;

    if (upcoming.length === 0) {
      nextSection.innerHTML += `<div style="color: var(--text-muted); font-size: 13px; padding: 10px;">A fila está vazia. Adicione músicas com o botão direito!</div>`;
    } else {
      upcoming.forEach((track, idx) => {
        const actualQueueIdx = window.player.queueIndex + 1 + idx;
        const coverSrc = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";

        const itemEl = document.createElement("div");
        itemEl.className = "queue-item";
        itemEl.innerHTML = `
          <img src="${coverSrc}" class="queue-item-thumb" alt="Cover">
          <div class="queue-item-info">
            <span class="queue-item-title">${track.title}</span>
            <span class="queue-item-artist">${track.artist}</span>
          </div>
          <button class="btn-remove-queue" title="Remover da fila">
            <i data-lucide="x"></i>
          </button>
        `;

        itemEl.addEventListener("click", (e) => {
          if (e.target.closest(".btn-remove-queue")) return;
          window.player.playTrack(track);
        });

        itemEl.addEventListener("contextmenu", (e) => {
          this.showContextMenu(e, track);
        });

        const btnRemove = itemEl.querySelector(".btn-remove-queue");
        if (btnRemove) {
          btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            window.player.removeFromQueue(actualQueueIdx);
          });
        }

        nextSection.appendChild(itemEl);
      });
    }

    this.queueBody.appendChild(nextSection);
    this.refreshIcons();
  }

  updateVolumeUI(vol) {
    const pct = Math.round(vol * 100);
    
    if (this.volumeBar) {
      this.volumeBar.value = pct;
      this.volumeBar.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${pct}%, var(--bg-surface-hover) ${pct}%, var(--bg-surface-hover) 100%)`;
    }

    let iconName = "volume-2";
    if (vol <= 0.001) {
      iconName = "volume-x";
    } else if (vol < 0.35) {
      iconName = "volume";
    } else if (vol < 0.70) {
      iconName = "volume-1";
    } else {
      iconName = "volume-2";
    }

    if (this.volIcon) {
      this.volIcon.setAttribute("data-lucide", iconName);
      this.refreshIcons();
    }
  }

  escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  bindSearch() {
    if (!this.searchInput) return;
    let timeout = null;

    if (this.btnSearchClear) {
      this.btnSearchClear.addEventListener("click", () => {
        this.searchInput.value = "";
        this.btnSearchClear.style.display = "none";
        if (this.currentView === "search") {
          this.switchView(this.previousViewBeforeSearch || "home");
        }
      });
    }

    this.searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      const query = e.target.value.trim();
      
      if (this.btnSearchClear) {
        this.btnSearchClear.style.display = query ? "flex" : "none";
      }

      if (!query) {
        if (this.currentView === "search") {
          this.switchView(this.previousViewBeforeSearch || "home");
        }
        return;
      }

      if (this.currentView !== "search") {
        this.previousViewBeforeSearch = this.currentView;
        this.switchView("search");
      }

      if (this.searchResultsContainer) {
        this.searchResultsContainer.innerHTML = `
          <div class="search-empty-state">
            <div style="font-size: 24px; animation: spin 1s linear infinite;"><i data-lucide="loader-2"></i></div>
            <div>Buscando por "${this.escapeHtml(query)}"...</div>
          </div>
        `;
        this.refreshIcons();
      }

      timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          this.renderSearchResults(data.results || {}, query);
        } catch (err) {
          console.error("[App] Erro na busca:", err);
          if (this.searchResultsContainer) {
            this.searchResultsContainer.innerHTML = `
              <div class="search-empty-state">
                <div class="search-empty-icon"><i data-lucide="alert-circle"></i></div>
                <div>Erro ao realizar busca. Tente novamente.</div>
              </div>
            `;
            this.refreshIcons();
          }
        }
      }, 200);
    });
  }

  renderSearchResults(results, query) {
    if (!this.searchResultsContainer) return;

    const tracks = results.tracks || [];
    const albums = results.albums || [];
    const artists = results.artists || [];
    const playlists = results.playlists || [];
    const total = results.total || (tracks.length + albums.length + artists.length + playlists.length);

    if (this.searchHeaderTitle) {
      this.searchHeaderTitle.textContent = `Resultados para "${query}"`;
    }
    if (this.searchHeaderSubtitle) {
      this.searchHeaderSubtitle.textContent = total > 0 
        ? `Encontrado(s) ${total} resultado(s) na sua biblioteca.`
        : `Nenhum resultado encontrado para sua pesquisa.`;
    }

    if (total === 0) {
      this.searchResultsContainer.innerHTML = `
        <div class="search-empty-state">
          <div class="search-empty-icon"><i data-lucide="search-x"></i></div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Nenhum resultado encontrado</div>
          <div style="font-size: 13px; color: var(--text-secondary); max-width: 380px;">Não encontramos nenhuma música, álbum, artista ou playlist correspondente a "${this.escapeHtml(query)}".</div>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    let html = "";

    // 1. Músicas / Faixas
    if (tracks.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-header">
            <h2 class="search-section-title">
              <i data-lucide="music" style="color: var(--accent-primary); width: 18px; height: 18px;"></i>
              Músicas
            </h2>
            <span class="search-section-count">${tracks.length} encontrada(s)</span>
          </div>
          <div class="search-list">
      `;

      tracks.forEach(track => {
        const coverUrl = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
        const isCurrentPlaying = window.player.currentTrack?.id === track.id;
        const durStr = AudioPlayer.formatTime(track.duration || 0);

        html += `
          <div class="search-result-item ${isCurrentPlaying ? 'playing' : ''}" data-type="track" data-id="${track.id}">
            <img src="${coverUrl}" class="search-thumb" alt="Cover" loading="lazy">
            <div class="search-item-info">
              <span class="search-item-title">${this.escapeHtml(track.title)}</span>
              <div class="search-item-meta-row">
                <span class="search-badge badge-track">Faixa</span>
                <span class="search-item-meta">• ${this.escapeHtml(track.artist)} • ${durStr}</span>
              </div>
            </div>
            <div class="search-item-actions">
              <button class="btn-fav-table ${track.is_favorite ? 'active' : ''}" data-id="${track.id}" title="Favoritar">
                <i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>
              </button>
              <button class="btn-more-table" data-id="${track.id}" title="Mais opções">
                <i data-lucide="more-horizontal"></i>
              </button>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    // 2. Álbuns
    if (albums.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-header">
            <h2 class="search-section-title">
              <i data-lucide="disc" style="color: var(--accent-secondary); width: 18px; height: 18px;"></i>
              Álbuns
            </h2>
            <span class="search-section-count">${albums.length} encontrado(s)</span>
          </div>
          <div class="search-list">
      `;

      albums.forEach(album => {
        const coverUrl = album.cover_hash ? `/api/covers/${album.cover_hash}` : "/static/img/default-cover.svg";
        html += `
          <div class="search-result-item" data-type="album" data-name="${this.escapeHtml(album.album)}">
            <img src="${coverUrl}" class="search-thumb" alt="Cover" loading="lazy">
            <div class="search-item-info">
              <span class="search-item-title">${this.escapeHtml(album.album)}</span>
              <div class="search-item-meta-row">
                <span class="search-badge badge-album">Álbum</span>
                <span class="search-item-meta">• ${this.escapeHtml(album.artist || "Vários Artistas")} • ${album.track_count} música(s)</span>
              </div>
            </div>
            <i data-lucide="chevron-right" style="color: var(--text-muted); width: 18px; height: 18px; margin-right: 4px;"></i>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    // 3. Artistas
    if (artists.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-header">
            <h2 class="search-section-title">
              <i data-lucide="users" style="color: #a855f7; width: 18px; height: 18px;"></i>
              Artistas
            </h2>
            <span class="search-section-count">${artists.length} encontrado(s)</span>
          </div>
          <div class="search-list">
      `;

      artists.forEach(artist => {
        const coverUrl = artist.cover_hash ? `/api/covers/${artist.cover_hash}` : "/static/img/default-cover.svg";
        html += `
          <div class="search-result-item" data-type="artist" data-name="${this.escapeHtml(artist.artist)}">
            <img src="${coverUrl}" class="search-thumb artist-round" alt="Artist" loading="lazy">
            <div class="search-item-info">
              <span class="search-item-title">${this.escapeHtml(artist.artist)}</span>
              <div class="search-item-meta-row">
                <span class="search-badge badge-artist">Artista</span>
                <span class="search-item-meta">• ${artist.track_count} música(s)</span>
              </div>
            </div>
            <i data-lucide="chevron-right" style="color: var(--text-muted); width: 18px; height: 18px; margin-right: 4px;"></i>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    // 4. Playlists
    if (playlists.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-header">
            <h2 class="search-section-title">
              <i data-lucide="list-music" style="color: #f59e0b; width: 18px; height: 18px;"></i>
              Playlists
            </h2>
            <span class="search-section-count">${playlists.length} encontrada(s)</span>
          </div>
          <div class="search-list">
      `;

      playlists.forEach(pl => {
        const coverUrl = pl.cover_hash ? `/api/covers/${pl.cover_hash}` : "/static/img/default-cover.svg";
        html += `
          <div class="search-result-item" data-type="playlist" data-id="${pl.id}">
            <img src="${coverUrl}" class="search-thumb" alt="Playlist" loading="lazy">
            <div class="search-item-info">
              <span class="search-item-title">${this.escapeHtml(pl.name)}</span>
              <div class="search-item-meta-row">
                <span class="search-badge badge-playlist">Playlist</span>
                <span class="search-item-meta">• ${pl.track_count || 0} música(s)</span>
              </div>
            </div>
            <i data-lucide="chevron-right" style="color: var(--text-muted); width: 18px; height: 18px; margin-right: 4px;"></i>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    this.searchResultsContainer.innerHTML = html;
    this.refreshIcons();

    // Eventos de clique nos itens encontrados
    this.searchResultsContainer.querySelectorAll(".search-result-item").forEach(item => {
      const type = item.dataset.type;

      if (type === "track") {
        const trackId = parseInt(item.dataset.id, 10);
        const track = tracks.find(t => t.id === trackId);
        
        item.addEventListener("click", (e) => {
          if (e.target.closest(".btn-fav-table") || e.target.closest(".btn-more-table")) {
            return;
          }
          if (track) {
            window.player.playTrack(track, tracks);
          }
        });

        const favBtn = item.querySelector(".btn-fav-table");
        if (favBtn && track) {
          favBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const res = await fetch(`/api/tracks/${track.id}/favorite`, { method: "POST" });
            const d = await res.json();
            track.is_favorite = d.is_favorite ? 1 : 0;
            favBtn.classList.toggle("active", Boolean(track.is_favorite));
            favBtn.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
            this.refreshIcons();
            this.showToast(track.is_favorite ? "Adicionado aos Favoritos" : "Removido dos Favoritos", "success");
          });
        }

        const moreBtn = item.querySelector(".btn-more-table");
        if (moreBtn && track) {
          moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showContextMenu(e, track);
          });
        }
      } else if (type === "album") {
        const albumName = item.dataset.name;
        const album = albums.find(a => a.album === albumName);
        item.addEventListener("click", () => {
          if (album) this.openAlbumDetail(album);
        });
      } else if (type === "artist") {
        const artistName = item.dataset.name;
        const artist = artists.find(a => a.artist === artistName);
        item.addEventListener("click", () => {
          if (artist) this.openArtistDetail(artist);
        });
      } else if (type === "playlist") {
        const plId = parseInt(item.dataset.id, 10);
        const playlist = playlists.find(p => p.id === plId);
        item.addEventListener("click", () => {
          if (playlist) this.openPlaylistDetail(playlist);
        });
      }
    });
  }

  async loadLibraryTracks() {
    try {
      const res = await fetch("/api/tracks?limit=500");
      const data = await res.json();
      this.allTracks = data.tracks || [];
      this.renderTrackTable(this.allTracks, "tracksTableBody");
      this.renderQuickAccessGrid();
      this.renderRecentGrid(this.allTracks.slice(0, 8));
      
      const sub = document.getElementById("tracksSubtitle");
      if (sub) sub.textContent = `${this.allTracks.length} faixa(s) na sua biblioteca.`;
    } catch (e) {
      console.error("[App] Erro ao carregar faixas:", e);
    }
  }

  async loadPlaylists() {
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      this.allPlaylists = data.playlists || [];
      this.renderPlaylistsGrid(this.allPlaylists, "playlistsGrid");
      this.renderPlaylistsGrid(this.allPlaylists.slice(0, 6), "homePlaylistsGrid");
    } catch (e) {
      console.error("[App] Erro ao carregar playlists:", e);
    }
  }

  async loadAlbums() {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      this.allAlbums = data.albums || [];
      this.renderAlbumsGrid(this.allAlbums);
      this.renderFeaturedAlbumsGrid(this.allAlbums.slice(0, 6));
    } catch (e) {
      console.error("[App] Erro ao carregar álbuns:", e);
    }
  }

  async loadArtists() {
    try {
      const res = await fetch("/api/artists");
      const data = await res.json();
      this.allArtists = data.artists || [];
      this.renderArtistsGrid(this.allArtists);
    } catch (e) {
      console.error("[App] Erro ao carregar artistas:", e);
    }
  }

  async loadFavorites() {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      this.renderTrackTable(data.tracks || [], "favoritesTableBody");
    } catch (e) {
      console.error("[App] Erro ao carregar favoritos:", e);
    }
  }

  renderQuickAccessGrid() {
    const grid = document.getElementById("homeQuickAccessGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const items = this.allTracks.slice(0, 6);
    if (items.length === 0) return;

    items.forEach(track => {
      const card = document.createElement("div");
      card.className = "quick-card";
      const coverSrc = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <img src="${coverSrc}" class="quick-card-img" alt="Cover">
        <span class="quick-card-title">${track.title}</span>
        <button class="quick-card-play-btn" title="Tocar">
          <i data-lucide="play"></i>
        </button>
      `;

      card.addEventListener("click", () => {
        window.player.playTrack(track, this.allTracks);
      });

      card.addEventListener("contextmenu", (e) => {
        this.showContextMenu(e, track);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  renderPlaylistsGrid(playlists, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";

    if (playlists.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma playlist criada ainda.</div>`;
      return;
    }

    playlists.forEach(pl => {
      const card = document.createElement("div");
      card.className = "media-card";
      const coverSrc = pl.cover_hash ? `/api/covers/${pl.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${coverSrc}" class="media-card-img" alt="Cover">
          <button class="card-play-btn" title="Tocar Playlist">
            <i data-lucide="play"></i>
          </button>
        </div>
        <div class="media-card-title">${pl.name}</div>
        <div class="media-card-desc">${pl.track_count || 0} faixa(s)</div>
      `;

      card.addEventListener("click", () => {
        this.openPlaylistDetail(pl);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  async openPlaylistDetail(playlist) {
    this.currentViewingPlaylist = playlist;
    const titleEl = document.getElementById("playlistDetailTitle");
    const metaEl = document.getElementById("playlistDetailMeta");
    const coverEl = document.getElementById("playlistDetailCover");

    if (titleEl) titleEl.textContent = playlist.name;
    if (metaEl) metaEl.textContent = `${playlist.track_count || 0} música(s) • ${playlist.description || "Playlist personalizada"}`;
    if (coverEl) coverEl.src = playlist.cover_hash ? `/api/covers/${playlist.cover_hash}` : "/static/img/default-cover.svg";

    this.switchView("playlist-detail");

    try {
      const res = await fetch(`/api/playlists/${playlist.id}`);
      const data = await res.json();
      this.currentPlaylistTracks = data.tracks || [];
      this.renderTrackTable(this.currentPlaylistTracks, "playlistTracksTableBody", true);
      this.updateDetailPlayButtons();
    } catch (e) {
      console.error(e);
    }
  }

  renderTrackTable(tracks, tableBodyId, isPlaylist = false) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    tbody.innerHTML = "";
    if (tracks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 50px;">Nenhuma música encontrada</td></tr>`;
      return;
    }

    tracks.forEach((track, index) => {
      const tr = document.createElement("tr");
      tr.className = "track-row";
      tr.dataset.id = track.id;
      const isThisTrackPlaying = window.player.currentTrack && window.player.currentTrack.id === track.id;
      if (isThisTrackPlaying) {
        tr.classList.add("playing");
      }

      const coverSrc = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
      const lyricsBadge = track.has_lyrics ? `<span class="badge-lyrics">${track.synced_lyrics ? 'LRC' : 'LETRA'}</span>` : "";

      const isAlbumView = tableBodyId === "albumTracksTableBody";
      const displayNumber = (isAlbumView && track.track_number) ? track.track_number : (index + 1);

      const colNumContent = isThisTrackPlaying && window.player.isPlaying
        ? `<div class="equalizer-anim"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>`
        : displayNumber;

      tr.innerHTML = `
        <td class="col-num">${colNumContent}</td>
        <td>
          <div class="track-info-cell">
            <img src="${coverSrc}" class="track-thumb" alt="Cover">
            <div class="track-meta">
              <span class="track-title">${track.title} ${lyricsBadge}</span>
              <span class="track-artist">${track.artist}</span>
            </div>
          </div>
        </td>
        <td class="track-album">${track.album || "—"}</td>
        <td style="color: var(--text-muted); font-variant-numeric: tabular-nums;">${AudioPlayer.formatTime(track.duration)}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 4px;">
            <button class="btn-fav-table ${track.is_favorite ? 'active' : ''}" data-id="${track.id}" title="Favorito">
              <i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>
            </button>
            <button class="btn-more-table" data-id="${track.id}" title="Mais opções">
              <i data-lucide="more-vertical"></i>
            </button>
          </div>
        </td>
      `;

      tr.addEventListener("click", (e) => {
        if (e.target.closest(".btn-fav-table") || e.target.closest(".btn-more-table")) return;
        window.player.playTrack(track, tracks);
      });

      tr.addEventListener("contextmenu", (e) => {
        this.showContextMenu(e, track);
      });

      const moreBtn = tr.querySelector(".btn-more-table");
      if (moreBtn) {
        moreBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.showContextMenu(e, track);
        });
      }

      const favBtn = tr.querySelector(".btn-fav-table");
      if (favBtn) {
        favBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const res = await fetch(`/api/tracks/${track.id}/favorite`, { method: "POST" });
          const d = await res.json();
          track.is_favorite = d.is_favorite ? 1 : 0;
          favBtn.classList.toggle("active", Boolean(track.is_favorite));
          favBtn.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
          this.refreshIcons();
          this.showToast(track.is_favorite ? "Adicionado aos Favoritos" : "Removido dos Favoritos", "success");
        });
      }

      tbody.appendChild(tr);
    });

    this.refreshIcons();
  }

  renderRecentGrid(tracks) {
    const grid = document.getElementById("homeRecentGrid");
    if (!grid) return;
    grid.innerHTML = "";

    tracks.forEach(track => {
      const card = document.createElement("div");
      card.className = "media-card";
      const coverSrc = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${coverSrc}" class="media-card-img" alt="Cover">
          <button class="card-play-btn" title="Tocar">
            <i data-lucide="play"></i>
          </button>
        </div>
        <div class="media-card-title">${track.title}</div>
        <div class="media-card-desc">${track.artist}</div>
      `;

      card.addEventListener("click", () => {
        window.player.playTrack(track, this.allTracks);
      });

      card.addEventListener("contextmenu", (e) => {
        this.showContextMenu(e, track);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  renderFeaturedAlbumsGrid(albums) {
    const grid = document.getElementById("homeFeaturedAlbumsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    albums.forEach(album => {
      const card = document.createElement("div");
      card.className = "media-card";
      const coverSrc = album.cover_hash ? `/api/covers/${album.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${coverSrc}" class="media-card-img" alt="Cover">
          <button class="card-play-btn" title="Tocar Álbum">
            <i data-lucide="play"></i>
          </button>
        </div>
        <div class="media-card-title">${album.album}</div>
        <div class="media-card-desc">${album.artist}</div>
      `;

      card.addEventListener("click", () => {
        this.openAlbumDetail(album);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  renderAlbumsGrid(albums) {
    const grid = document.getElementById("albumsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (albums.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum álbum encontrado</div>`;
      return;
    }

    albums.forEach(album => {
      const card = document.createElement("div");
      card.className = "media-card";
      const coverSrc = album.cover_hash ? `/api/covers/${album.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${coverSrc}" class="media-card-img" alt="Cover">
          <button class="card-play-btn" title="Tocar Álbum">
            <i data-lucide="play"></i>
          </button>
        </div>
        <div class="media-card-title">${album.album}</div>
        <div class="media-card-desc">${album.artist} • ${album.track_count} faixa(s)</div>
      `;

      card.addEventListener("click", () => {
        this.openAlbumDetail(album);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  async openAlbumDetail(album) {
    const albumTitle = document.getElementById("albumDetailTitle");
    const albumMeta = document.getElementById("albumDetailMeta");
    const albumCover = document.getElementById("albumDetailCover");

    if (albumTitle) albumTitle.textContent = album.album;
    if (albumMeta) albumMeta.textContent = `${album.artist} • ${album.track_count || ''} música(s)`;
    if (albumCover) albumCover.src = album.cover_hash ? `/api/covers/${album.cover_hash}` : "/static/img/default-cover.svg";

    this.switchView("album-detail");

    try {
      const res = await fetch(`/api/albums/${encodeURIComponent(album.album)}?artist=${encodeURIComponent(album.artist)}`);
      const data = await res.json();
      this.currentAlbumTracks = data.tracks || [];
      this.renderTrackTable(this.currentAlbumTracks, "albumTracksTableBody");
      this.updateDetailPlayButtons();
    } catch (e) {
      console.error(e);
    }
  }

  renderArtistsGrid(artists) {
    const grid = document.getElementById("artistsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (artists.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum artista encontrado</div>`;
      return;
    }

    artists.forEach(art => {
      const card = document.createElement("div");
      card.className = "media-card artist-card";
      const coverSrc = art.cover_hash ? `/api/covers/${art.cover_hash}` : "/static/img/default-cover.svg";

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${coverSrc}" class="media-card-img" alt="Artist">
          <button class="card-play-btn" title="Tocar Artista">
            <i data-lucide="play"></i>
          </button>
        </div>
        <div class="media-card-title">${art.artist}</div>
        <div class="media-card-desc">${art.track_count} faixa(s)</div>
      `;

      card.addEventListener("click", () => {
        this.openArtistDetail(art);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  async openArtistDetail(art) {
    const artistTitle = document.getElementById("artistDetailTitle");
    const artistMeta = document.getElementById("artistDetailMeta");
    const artistCover = document.getElementById("artistDetailCover");

    if (artistTitle) artistTitle.textContent = art.artist;
    if (artistMeta) artistMeta.textContent = `${art.track_count || ''} música(s) na biblioteca`;
    if (artistCover) artistCover.src = art.cover_hash ? `/api/covers/${art.cover_hash}` : "/static/img/default-cover.svg";

    this.switchView("artist-detail");

    try {
      const res = await fetch(`/api/artists/${encodeURIComponent(art.artist)}`);
      const data = await res.json();
      this.currentArtistTracks = data.tracks || [];
      this.renderTrackTable(this.currentArtistTracks, "artistTracksTableBody");
      this.updateDetailPlayButtons();
    } catch (e) {
      console.error(e);
    }
  }

  updateDetailPlayButtons() {
    const isPlaying = window.player.isPlaying;
    const currId = window.player.currentTrack?.id;

    if (this.btnPlayAlbumAll) {
      const isAlbumPlaying = isPlaying && this.currentAlbumTracks.some(t => t.id === currId);
      if (isAlbumPlaying) {
        this.btnPlayAlbumAll.classList.add("playing");
        this.btnPlayAlbumAll.innerHTML = `<i data-lucide="pause" style="fill: currentColor;"></i> <span>Pausar</span>`;
      } else {
        this.btnPlayAlbumAll.classList.remove("playing");
        this.btnPlayAlbumAll.innerHTML = `<i data-lucide="play" style="fill: currentColor;"></i> <span>Tocar Álbum</span>`;
      }
    }

    if (this.btnPlayArtistAll) {
      const isArtistPlaying = isPlaying && this.currentArtistTracks.some(t => t.id === currId);
      if (isArtistPlaying) {
        this.btnPlayArtistAll.classList.add("playing");
        this.btnPlayArtistAll.innerHTML = `<i data-lucide="pause" style="fill: currentColor;"></i> <span>Pausar</span>`;
      } else {
        this.btnPlayArtistAll.classList.remove("playing");
        this.btnPlayArtistAll.innerHTML = `<i data-lucide="play" style="fill: currentColor;"></i> <span>Tocar Músicas</span>`;
      }
    }

    if (this.btnPlayPlaylistAll) {
      const isPlaylistPlaying = isPlaying && this.currentPlaylistTracks.some(t => t.id === currId);
      if (isPlaylistPlaying) {
        this.btnPlayPlaylistAll.classList.add("playing");
        this.btnPlayPlaylistAll.innerHTML = `<i data-lucide="pause" style="fill: currentColor;"></i> <span>Pausar</span>`;
      } else {
        this.btnPlayPlaylistAll.classList.remove("playing");
        this.btnPlayPlaylistAll.innerHTML = `<i data-lucide="play" style="fill: currentColor;"></i> <span>Tocar Playlist</span>`;
      }
    }

    this.refreshIcons();
  }

  onTrackChanged(track) {
    const mainPlayer = document.getElementById("mainPlayerBar");
    if (mainPlayer) mainPlayer.classList.add("has-track");
    document.body.classList.add("has-active-player");

    this.playerTitle.textContent = track.title;
    this.playerArtist.textContent = track.artist;
    const coverUrl = track.cover_hash ? `/api/covers/${track.cover_hash}` : "/static/img/default-cover.svg";
    this.playerCover.src = coverUrl;

    if (this.btnFavCurrent) {
      this.btnFavCurrent.classList.toggle("active", Boolean(track.is_favorite));
      this.btnFavCurrent.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
    }

    // Sincroniza a tela cheia mobile
    this.syncMobileNowPlaying(track);

    document.querySelectorAll(".track-row").forEach(row => {
      row.classList.toggle("playing", row.dataset.id === String(track.id));
    });

    if (window.lyricsViewer) {
      window.lyricsViewer.updateTrackInfo(track);
      window.lyricsViewer.loadLyrics(track.id);
    }

    this.updateDetailPlayButtons();
    this.renderQueue();
    this.refreshIcons();
  }

  onTimeUpdated(currentTime, duration) {
    const formattedCur = AudioPlayer.formatTime(currentTime);
    const formattedDur = AudioPlayer.formatTime(duration);

    if (this.timeCurrent) this.timeCurrent.textContent = formattedCur;
    if (this.timeTotal && duration > 0) this.timeTotal.textContent = formattedDur;

    if (this.mnpTimeCurrent) this.mnpTimeCurrent.textContent = formattedCur;
    if (this.mnpTimeTotal && duration > 0) this.mnpTimeTotal.textContent = formattedDur;

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (this.seekBar && duration > 0) {
      this.seekBar.value = pct;
      this.seekBar.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${pct}%, var(--bg-surface-hover) ${pct}%, var(--bg-surface-hover) 100%)`;
    }

    if (this.mnpSeekBar && duration > 0) {
      this.mnpSeekBar.value = pct;
      this.mnpSeekBar.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${pct}%, var(--bg-surface-hover) ${pct}%, var(--bg-surface-hover) 100%)`;
    }

    if (this.mobileProgressFill) {
      this.mobileProgressFill.style.width = `${pct}%`;
    }

    if (window.lyricsViewer) {
      window.lyricsViewer.onTimeUpdate(currentTime);
    }
  }

  onPlaybackStateChanged(state) {
    const isPlaying = state === "playing";
    
    if (this.btnPlayPause) {
      this.btnPlayPause.innerHTML = `<i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>`;
    }

    if (this.btnMobilePlayPause) {
      this.btnMobilePlayPause.innerHTML = `<i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>`;
    }

    if (this.btnMnpPlayPause) {
      this.btnMnpPlayPause.innerHTML = `<i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>`;
    }

    this.refreshIcons();

    if (["tracks", "album-detail", "artist-detail", "playlist-detail", "favorites"].includes(this.currentView)) {
      const activeRow = document.querySelector(`.track-row[data-id="${window.player.currentTrack?.id}"] .col-num`);
      if (activeRow) {
        activeRow.innerHTML = isPlaying
          ? `<div class="equalizer-anim"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>`
          : (window.player.currentTrack?.track_number || "1");
      }
    }

    this.updateDetailPlayButtons();
  }

  async toggleCurrentFavorite() {
    const track = window.player.currentTrack;
    if (!track) return;
    const res = await fetch(`/api/tracks/${track.id}/favorite`, { method: "POST" });
    const d = await res.json();
    track.is_favorite = d.is_favorite ? 1 : 0;

    if (this.btnFavCurrent) {
      this.btnFavCurrent.classList.toggle("active", Boolean(track.is_favorite));
      this.btnFavCurrent.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
    }

    if (this.btnMnpFav) {
      this.btnMnpFav.classList.toggle("active", Boolean(track.is_favorite));
      this.btnMnpFav.innerHTML = `<i data-lucide="heart" style="${track.is_favorite ? 'fill: #10b981; color: #10b981;' : ''}"></i>`;
    }

    this.refreshIcons();
    this.showToast(track.is_favorite ? "Adicionado aos Favoritos" : "Removido dos Favoritos", "success");
  }

  async triggerLibraryScan() {
    const btn = document.getElementById("btnScanLibrary");
    if (btn) btn.disabled = true;
    try {
      await fetch("/api/scan", { method: "POST" });
      this.showToast("Varredura iniciada em segundo plano!", "info");
      this.loadLibraryTracks();
      this.loadAlbums();
      this.loadArtists();
      this.loadPlaylists();
    } catch (e) {
      console.error(e);
    } finally {
      if (btn) btn.disabled = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
