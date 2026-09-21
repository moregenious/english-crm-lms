/**
 * Interactive ESL Audio Player Component with Slowdown Controls (0.5x, 0.75x, 0.85x, 1.0x, 1.25x, 1.5x)
 * Supports all audio formats (MP3, WMA, WAV, M4A, OGG, FLAC, AAC, WEBM, OPUS)
 */

export const AudioPlayer = {
  renderPlayerHtml(audioFile, uniqueId = 'player-' + Math.floor(Math.random() * 10000)) {
    const fileName = audioFile.name || 'Аудиозапись к уроку';
    const ext = fileName.split('.').pop().toUpperCase();

    return `
      <div class="esl-audio-player" id="${uniqueId}" data-src="${audioFile.url}">
        <audio class="audio-element" preload="metadata" src="${audioFile.url}"></audio>
        
        <div class="audio-player-header">
          <div class="audio-title-wrap">
            <span class="audio-icon">🎧</span>
            <div style="min-width:0; flex:1;">
              <div class="audio-file-name font-semibold text-sm" title="${fileName}">${fileName}</div>
              <div class="text-xs text-muted" style="display:flex; align-items:center; gap:6px; margin-top:2px; flex-wrap:wrap;">
                <span class="badge" style="font-size:0.65rem; background:rgba(14, 165, 233, 0.1); color:var(--color-primary);">${ext}</span>
                <span>${audioFile.size || 'Аудиозапись к уроку'}</span>
                <span class="audio-slowdown-badge badge" style="font-size:0.65rem; background:#fef3c7; color:#92400e; display:none;">🐢 Замедлено</span>
              </div>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="audio-time-display text-xs font-mono">
              <span class="time-current">0:00</span> / <span class="time-duration">0:00</span>
            </div>
            <a href="${audioFile.url}" download="${fileName}" class="btn btn-xs btn-ghost" title="Скачать аудиофайл" style="padding:2px 8px; font-size:0.75rem; color:var(--color-primary); text-decoration:none;">
              ⬇ Скачать
            </a>
          </div>
        </div>

        <!-- Scrubber -->
        <div class="audio-progress-wrap">
          <input type="range" class="audio-scrubber" min="0" max="100" value="0" step="0.1" title="Перемотка">
        </div>

        <!-- Controls Row -->
        <div class="audio-controls-bar">
          <!-- Playback and Rewind -->
          <div class="audio-main-btns">
            <button type="button" class="btn btn-sm btn-ghost btn-audio-rewind" title="Назад на 5 секунд">
              ⏪ -5s
            </button>
            <button type="button" class="btn btn-primary btn-audio-play-toggle" title="Воспроизвести / Пауза">
              <span class="play-icon">▶</span>
            </button>
            <button type="button" class="btn btn-sm btn-ghost btn-audio-forward" title="Вперед на 5 секунд">
              +5s ⏩
            </button>
          </div>

          <!-- Speed Slowdown Controller -->
          <div class="audio-speed-selector">
            <span class="speed-label text-xs font-bold text-muted">Скорость:</span>
            <div class="speed-btn-group">
              <button type="button" class="btn-speed" data-rate="0.5" title="Замедление в 2 раза">0.5x 🐢</button>
              <button type="button" class="btn-speed" data-rate="0.75" title="Замедление на 25%">0.75x</button>
              <button type="button" class="btn-speed" data-rate="0.85" title="Легкое замедление">0.85x</button>
              <button type="button" class="btn-speed active" data-rate="1.0" title="Обычная скорость">1.0x</button>
              <button type="button" class="btn-speed" data-rate="1.25" title="Ускорение">1.25x</button>
              <button type="button" class="btn-speed" data-rate="1.5" title="Ускорение в 1.5 раза">1.5x 🐇</button>
            </div>
          </div>
        </div>

        <!-- Error notice if codec unsupported in browser -->
        <div class="audio-error-notice text-xs" style="display:none; color:var(--color-danger); padding:4px 8px; margin-top:4px; background:#fee2e2; border-radius:4px;">
          Не удалось воспроизвести данный аудиоформат в браузере. Вы можете <a href="${audioFile.url}" download="${fileName}" style="font-weight:700; text-decoration:underline;">скачать файл</a> на устройство.
        </div>
      </div>
    `;
  },

  bindAll(container = document) {
    container.querySelectorAll('.esl-audio-player').forEach(playerEl => {
      if (playerEl.dataset.initialized) return;
      playerEl.dataset.initialized = 'true';

      const audio = playerEl.querySelector('.audio-element');
      const playBtn = playerEl.querySelector('.btn-audio-play-toggle');
      const playIcon = playerEl.querySelector('.play-icon');
      const rewindBtn = playerEl.querySelector('.btn-audio-rewind');
      const forwardBtn = playerEl.querySelector('.btn-audio-forward');
      const scrubber = playerEl.querySelector('.audio-scrubber');
      const currentEl = playerEl.querySelector('.time-current');
      const durationEl = playerEl.querySelector('.time-duration');
      const speedBtns = playerEl.querySelectorAll('.btn-speed');
      const slowdownBadge = playerEl.querySelector('.audio-slowdown-badge');
      const errorNotice = playerEl.querySelector('.audio-error-notice');

      const formatTime = (secs) => {
        if (isNaN(secs) || !isFinite(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };

      // Metadata loaded
      audio.addEventListener('loadedmetadata', () => {
        if (durationEl) durationEl.textContent = formatTime(audio.duration);
        if (errorNotice) errorNotice.style.display = 'none';
      });

      audio.addEventListener('durationchange', () => {
        if (durationEl && audio.duration) durationEl.textContent = formatTime(audio.duration);
      });

      // Error handling
      audio.addEventListener('error', () => {
        if (errorNotice) errorNotice.style.display = 'block';
      });

      // Play / Pause Toggle
      playBtn?.addEventListener('click', () => {
        if (audio.paused) {
          // Pause any other playing audio players
          document.querySelectorAll('.audio-element').forEach(a => {
            if (a !== audio && !a.paused) a.pause();
          });
          audio.play().catch(e => {
            console.warn('Audio play prevented or format error:', e);
            if (errorNotice) errorNotice.style.display = 'block';
          });
        } else {
          audio.pause();
        }
      });

      audio.addEventListener('play', () => {
        if (playIcon) playIcon.textContent = '⏸';
        playBtn?.classList.add('playing');
      });

      audio.addEventListener('pause', () => {
        if (playIcon) playIcon.textContent = '▶';
        playBtn?.classList.remove('playing');
      });

      // Time Update
      audio.addEventListener('timeupdate', () => {
        if (currentEl) currentEl.textContent = formatTime(audio.currentTime);
        if (durationEl && (!durationEl.textContent || durationEl.textContent === '0:00') && audio.duration) {
          durationEl.textContent = formatTime(audio.duration);
        }
        if (audio.duration && scrubber) {
          scrubber.value = (audio.currentTime / audio.duration) * 100;
        }
      });

      // Ended
      audio.addEventListener('ended', () => {
        if (playIcon) playIcon.textContent = '▶';
        if (scrubber) scrubber.value = 0;
      });

      // Seek
      scrubber?.addEventListener('input', (e) => {
        if (audio.duration) {
          audio.currentTime = (e.target.value / 100) * audio.duration;
        }
      });

      // Rewind / Forward
      rewindBtn?.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      });

      forwardBtn?.addEventListener('click', () => {
        if (audio.duration) {
          audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        }
      });

      // Speed selector with natural voice pitch preservation (crucial for ESL speech perception)
      const setSpeed = (rate) => {
        audio.playbackRate = rate;
        audio.preservesPitch = true;
        if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = true;
        if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = true;

        speedBtns.forEach(b => {
          if (parseFloat(b.getAttribute('data-rate')) === rate) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        if (slowdownBadge) {
          if (rate < 1.0) {
            slowdownBadge.style.display = 'inline-block';
            slowdownBadge.textContent = `🐢 Замедление ${rate}x`;
          } else if (rate > 1.0) {
            slowdownBadge.style.display = 'inline-block';
            slowdownBadge.textContent = `🐇 Ускорение ${rate}x`;
          } else {
            slowdownBadge.style.display = 'none';
          }
        }
      };

      speedBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rate = parseFloat(e.currentTarget.getAttribute('data-rate'));
          setSpeed(rate);
        });
      });

      // Keyboard & Accessibility Support on Player
      playerEl.setAttribute('tabindex', '0');
      playerEl.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target !== scrubber) return;
        if (e.code === 'Space') {
          e.preventDefault();
          playBtn?.click();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          rewindBtn?.click();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          forwardBtn?.click();
        }
      });
    });
  }
};
