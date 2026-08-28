// --- Harmony Audio Player Core with Full LocalStorage State Persistence ---

class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.queue = [];
    this.queueIndex = -1;
    this.isPlaying = false;
    this.isShuffle = false;
    this.isRepeat = false; // false, 'all', 'one'
    this.volume = 0.8;
    this.audio.volume = this.volume;
    this.lastSavedTime = 0;
    this.hasRestoredInitialTime = false;

    // Callbacks para outros módulos (Letras, UI, Fila)
    this.onTrackChange = null;
    this.onTimeUpdate = null;
    this.onStateChange = null;
    this.onQueueChange = null;

    this.initAudioEvents();
  }

  initAudioEvents() {
    this.audio.addEventListener("timeupdate", () => {
      const curTime = this.audio.currentTime;
      const duration = this.audio.duration || (this.currentTrack ? this.currentTrack.duration : 0);

      if (this.onTimeUpdate) {
        this.onTimeUpdate(curTime, duration);
      }

      // Salva periodicamente a cada 1 segundo
      if (Math.abs(curTime - this.lastSavedTime) >= 1) {
        this.lastSavedTime = curTime;
        this.saveState();
      }
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      if (this.onStateChange) this.onStateChange("playing");
      this.saveState();
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      if (this.onStateChange) this.onStateChange("paused");
      this.saveState();
    });

    this.audio.addEventListener("ended", () => {
      if (this.isRepeat === "one") {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.next();
      }
    });

    this.audio.addEventListener("error", (e) => {
      console.error("[AudioPlayer] Erro na reprodução:", e);
      if (this.onStateChange) this.onStateChange("error");
    });

    // Salva estado ao fechar/atualizar a aba
    window.addEventListener("beforeunload", () => {
      this.saveState();
    });
  }

  playTrack(track, queueList = null) {
    if (!track) return;
    
    if (queueList && Array.isArray(queueList)) {
      this.queue = [...queueList];
      this.queueIndex = this.queue.findIndex(t => t.id === track.id);
      if (this.queueIndex === -1) {
        this.queue.unshift(track);
        this.queueIndex = 0;
      }
    } else if (this.queue.length === 0) {
      this.queue = [track];
      this.queueIndex = 0;
    } else {
      const existingIdx = this.queue.findIndex(t => t.id === track.id);
      if (existingIdx !== -1) {
        this.queueIndex = existingIdx;
      } else {
        this.queue.splice(this.queueIndex + 1, 0, track);
        this.queueIndex++;
      }
    }

    this.currentTrack = track;
    this.audio.src = `/api/stream/${track.id}`;
    this.audio.load();
    this.audio.play().catch(e => console.warn("Autoplay bloqueado pelo navegador:", e));

    if (this.onTrackChange) {
      this.onTrackChange(track);
    }
    if (this.onQueueChange) {
      this.onQueueChange();
    }

    this.saveState();
  }

  togglePlay() {
    if (!this.currentTrack && this.queue.length > 0) {
      this.playTrack(this.queue[0], this.queue);
      return;
    }
    if (!this.currentTrack) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      // Se tiver fonte mas não estiver tocando
      if (!this.audio.src || this.audio.src === "" || this.audio.src.endsWith("/null")) {
        this.audio.src = `/api/stream/${this.currentTrack.id}`;
        this.audio.load();
      }
      this.audio.play().catch(e => console.warn(e));
    }
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.isShuffle) {
      this.queueIndex = Math.floor(Math.random() * this.queue.length);
    } else {
      this.queueIndex++;
      if (this.queueIndex >= this.queue.length) {
        if (this.isRepeat === "all") {
          this.queueIndex = 0;
        } else {
          this.queueIndex = this.queue.length - 1;
          this.audio.pause();
          return;
        }
      }
    }

    this.playTrack(this.queue[this.queueIndex]);
  }

  prev() {
    if (this.queue.length === 0) return;

    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    this.queueIndex--;
    if (this.queueIndex < 0) {
      this.queueIndex = 0;
    }
    this.playTrack(this.queue[this.queueIndex]);
  }

  // --- Gerenciamento da Fila de Reprodução ---
  
  playNext(track) {
    if (!track) return;
    if (this.queue.length === 0) {
      this.playTrack(track);
      return;
    }
    this.queue.splice(this.queueIndex + 1, 0, track);
    if (this.onQueueChange) this.onQueueChange();
    this.saveState();
  }

  addToQueue(track) {
    if (!track) return;
    if (this.queue.length === 0) {
      this.playTrack(track);
      return;
    }
    this.queue.push(track);
    if (this.onQueueChange) this.onQueueChange();
    this.saveState();
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    if (index === this.queueIndex) {
      this.next();
    }
    this.queue.splice(index, 1);
    if (index < this.queueIndex) {
      this.queueIndex--;
    }
    if (this.onQueueChange) this.onQueueChange();
    this.saveState();
  }

  clearQueue() {
    if (this.currentTrack) {
      this.queue = [this.currentTrack];
      this.queueIndex = 0;
    } else {
      this.queue = [];
      this.queueIndex = -1;
    }
    if (this.onQueueChange) this.onQueueChange();
    this.saveState();
  }

  getUpcomingQueue() {
    if (this.queueIndex < 0 || this.queueIndex >= this.queue.length - 1) {
      return [];
    }
    return this.queue.slice(this.queueIndex + 1);
  }

  seek(seconds) {
    const dur = this.audio.duration || (this.currentTrack ? this.currentTrack.duration : 0);
    if (dur > 0) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, dur));
      this.saveState();
    }
  }

  seekPercent(percent) {
    const dur = this.audio.duration || (this.currentTrack ? this.currentTrack.duration : 0);
    if (dur > 0) {
      this.seek((percent / 100) * dur);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audio.volume = this.volume;
    this.saveState();
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.saveState();
    return this.isShuffle;
  }

  toggleRepeat() {
    if (!this.isRepeat) {
      this.isRepeat = "all";
    } else if (this.isRepeat === "all") {
      this.isRepeat = "one";
    } else {
      this.isRepeat = false;
    }
    this.saveState();
    return this.isRepeat;
  }

  // --- Persistência de Estado (LocalStorage) ---

  saveState() {
    try {
      if (this.currentTrack) {
        localStorage.setItem("harmony_track", JSON.stringify(this.currentTrack));
        localStorage.setItem("harmony_time", String(this.audio.currentTime || 0));
        localStorage.setItem("harmony_queue", JSON.stringify(this.queue));
        localStorage.setItem("harmony_queue_index", String(this.queueIndex));
      }
      localStorage.setItem("harmony_volume", String(this.volume));
      localStorage.setItem("harmony_shuffle", JSON.stringify(this.isShuffle));
      localStorage.setItem("harmony_repeat", JSON.stringify(this.isRepeat));
    } catch (e) {
      console.warn("[AudioPlayer] Não foi possível salvar estado no localStorage:", e);
    }
  }

  restoreState() {
    try {
      const savedVolume = localStorage.getItem("harmony_volume");
      if (savedVolume !== null) {
        this.setVolume(parseFloat(savedVolume));
      }

      const savedShuffle = localStorage.getItem("harmony_shuffle");
      if (savedShuffle !== null) {
        this.isShuffle = JSON.parse(savedShuffle);
      }

      const savedRepeat = localStorage.getItem("harmony_repeat");
      if (savedRepeat !== null) {
        this.isRepeat = JSON.parse(savedRepeat);
      }

      const savedTrackJson = localStorage.getItem("harmony_track");
      const savedTime = parseFloat(localStorage.getItem("harmony_time") || "0");
      const savedQueueJson = localStorage.getItem("harmony_queue");
      const savedQueueIndex = parseInt(localStorage.getItem("harmony_queue_index") || "0", 10);

      if (savedTrackJson) {
        const track = JSON.parse(savedTrackJson);
        const queue = savedQueueJson ? JSON.parse(savedQueueJson) : [track];
        
        this.currentTrack = track;
        this.queue = Array.isArray(queue) ? queue : [track];
        this.queueIndex = (savedQueueIndex >= 0 && savedQueueIndex < this.queue.length) ? savedQueueIndex : 0;
        
        // Define o áudio em modo pausado exatamente no tempo salvo
        this.audio.src = `/api/stream/${track.id}`;
        this.audio.load();

        const applySavedTime = () => {
          if (savedTime > 0 && this.audio.duration) {
            this.audio.currentTime = Math.min(savedTime, this.audio.duration);
          }
        };

        this.audio.addEventListener("loadedmetadata", applySavedTime, { once: true });

        if (this.onTrackChange) {
          this.onTrackChange(track);
        }
        if (this.onTimeUpdate) {
          this.onTimeUpdate(savedTime, track.duration || 0);
        }
        if (this.onStateChange) {
          this.onStateChange("paused");
        }
        if (this.onQueueChange) {
          this.onQueueChange();
        }
      }
    } catch (e) {
      console.warn("[AudioPlayer] Erro ao restaurar estado do localStorage:", e);
    }
  }

  static formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
}

// Instância global do player
window.player = new AudioPlayer();
