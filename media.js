let youtubePromise;

export function handleSoundShortcut(event, controller, enabled) {
  if (!enabled || !controller || event.defaultPrevented || (event.code !== 'Space' && event.key !== ' ')) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  // Native controls keep their own keyboard action, including the film button.
  if (event.target?.closest?.('button, a, input, textarea, select, summary, [contenteditable], [role="button"], [role="switch"]')) return;
  event.preventDefault();
  if (!event.repeat) controller.toggleSound();
}

function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubePromise) return youtubePromise;
  youtubePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => reject(new Error('Video player did not load')), 15000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      resolve(window.YT);
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { clearTimeout(timer); reject(new Error('Video player unavailable')); };
    document.head.append(script);
  });
  return youtubePromise;
}

export function videoSource(raw, origin) {
  if (!raw) return null;
  try {
    const url = new URL(raw, origin);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'youtube-nocookie.com'].includes(host) ? (url.searchParams.get('v') || url.pathname.split('/').pop()) : '';
    if (id && /^[\w-]{11}$/.test(id)) {
      const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
      embed.search = new URLSearchParams({ enablejsapi: '1', origin, autoplay: '1', mute: '1', playsinline: '1', controls: '0', disablekb: '1', fs: '0', rel: '0' });
      return { kind: 'youtube', url: embed.href, watch: `https://www.youtube.com/watch?v=${id}` };
    }
    if (/\.(mp4|webm)$/i.test(url.pathname)) return { kind: 'file', url: url.href, watch: url.href };
  } catch { /* Invalid configuration is shown as an unavailable film. */ }
  return null;
}

export function mountFilm(frame, film, { loadPlayer = loadYouTube, origin = location.origin } = {}) {
  const source = videoSource(film.url, origin);
  let player, video, ready = false, disposed = false, visible = true, soundOn = false, playing = false;
  const button = document.createElement('button');
  button.className = 'film-sound';
  button.type = 'button';
  button.disabled = true;
  button.innerHTML = '<span class="play-symbol" aria-hidden="true">▶</span>';
  const announcement = document.createElement('span');
  announcement.className = 'sr-only';
  announcement.setAttribute('aria-live', 'polite');

  function updateSound(announce = false) {
    button.setAttribute('aria-label', 'Film sound');
    button.setAttribute('aria-pressed', String(soundOn));
    if (announce) announcement.textContent = soundOn ? 'Sound on' : 'Sound off';
  }
  function blocked() {
    if (disposed || !visible) return;
    playing = false;
    frame.dataset.blocked = 'true';
    button.setAttribute('aria-label', 'Play film and toggle sound');
  }
  function play() {
    if (!ready || disposed || !visible) return;
    if (video) video.play().catch(error => {
      // Navigating to the catalog can cancel an in-flight play request.
      if (error.name !== 'AbortError') blocked();
    });
    else player.playVideo();
  }
  function setSound(enabled) {
    soundOn = enabled;
    if (video) video.muted = !soundOn;
    else if (ready) {
      if (soundOn) { player.setVolume(100); player.unMute(); }
      else player.mute();
    }
    updateSound(true);
  }
  function failed() {
    if (disposed) return;
    playing = false;
    ready = false;
    player?.destroy();
    video?.pause();
    frame.replaceChildren();
    const message = document.createElement('p');
    message.className = 'film-error';
    message.textContent = source ? 'The film could not load. ' : 'Film to come';
    if (source) {
      const link = document.createElement('a');
      link.href = source.watch;
      link.textContent = 'Watch film ↗';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      message.append(link);
    }
    frame.append(message);
  }
  function toggleSound() {
    if (!ready || disposed || !visible) return;
    setSound(!soundOn);
    if (!playing) play();
  }
  updateSound();
  button.addEventListener('click', toggleSound);
  if (!source) failed();
  else if (source.kind === 'file') {
    video = document.createElement('video');
    video.src = source.url;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = 'auto';
    video.disablePictureInPicture = true;
    if (film.poster) video.poster = film.poster;
    video.setAttribute('aria-label', film.title);
    video.addEventListener('playing', () => {
      if (disposed || !visible) { video.pause(); return; }
      playing = true;
      frame.dataset.blocked = 'false';
      updateSound();
    });
    video.addEventListener('pause', () => { playing = false; });
    video.addEventListener('ended', blocked);
    video.addEventListener('error', failed);
    frame.append(video, button, announcement);
    if (film.displayTitle) {
      const heading = document.createElement('div');
      heading.className = 'film-title';
      const title = document.createElement('span');
      title.textContent = film.displayTitle;
      heading.append(title);
      if (film.byline) {
        const byline = document.createElement('span');
        byline.className = 'film-byline';
        byline.textContent = film.byline;
        heading.append(byline);
      }
      frame.append(heading);
    }
    ready = true;
    button.disabled = false;
    play();
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = source.url;
    iframe.title = film.title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.tabIndex = -1;
    frame.append(iframe, button, announcement);
    loadPlayer().then(YT => {
      if (disposed) return;
      player = new YT.Player(iframe, { events: {
        onReady(event) {
          if (disposed) { event.target.destroy(); return; }
          player = event.target;
          player.mute();
          ready = true;
          button.disabled = false;
          if (visible) play(); else player.pauseVideo();
        },
        onStateChange(event) {
          if (disposed) return;
          if (event.data === 1) {
            if (!visible) { player.mute(); player.pauseVideo(); return; }
            playing = true;
            frame.dataset.blocked = 'false';
            updateSound();
          } else {
            playing = false;
            if (event.data === 0 || event.data === 2) blocked();
          }
        },
        onAutoplayBlocked: blocked,
        onError: failed,
      } });
    }).catch(failed);
  }
  return {
    toggleSound,
    setVisible(next) {
      const wasVisible = visible;
      visible = next;
      if (!visible) playing = false;
      if (!ready || disposed) return;
      if (!visible) {
        setSound(false);
        if (video) video.pause(); else player.pauseVideo();
      } else if (!wasVisible) play();
    },
    destroy() {
      disposed = true;
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      player?.destroy();
      frame.replaceChildren();
    },
  };
}
