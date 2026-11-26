export function handleSoundShortcut(event, controller, enabled) {
  if (!enabled || !controller || event.defaultPrevented || (event.code !== 'Space' && event.key !== ' ')) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('button, a, input, textarea, select, summary, [contenteditable], [role="button"], [role="switch"]')) return;
  event.preventDefault();
  if (!event.repeat) controller.toggleSound();
}

export function mountFilm(frame, film) {
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.preload = 'auto';
  video.disablePictureInPicture = true;
  video.poster = film.poster || '';
  video.setAttribute('aria-label', film.title);
  video.src = film.url;

  // Keep the original artwork above any native play badge until the first frame plays.
  const poster = document.createElement(film.poster ? 'img' : 'span');
  poster.className = 'film-poster';
  poster.setAttribute('aria-hidden', 'true');
  if (film.poster) {
    poster.alt = '';
    poster.src = film.poster;
  }
  const sound = document.createElement('button');
  sound.className = 'film-sound';
  sound.type = 'button';
  const announcement = document.createElement('span');
  announcement.className = 'sr-only';
  announcement.setAttribute('aria-live', 'polite');

  let disposed = false;
  let needsGesture = false;
  let playPending = false;
  function syncControl() {
    sound.setAttribute('aria-label', needsGesture ? 'Start film' : 'Film sound');
    if (needsGesture) sound.removeAttribute('aria-pressed');
    else sound.setAttribute('aria-pressed', String(!video.muted));
  }
  async function start() {
    if (playPending) return;
    playPending = true;
    try {
      await video.play();
    } catch (error) {
      if (!disposed && !sound.disabled && error.name === 'NotAllowedError') {
        needsGesture = true;
        syncControl();
      }
    } finally {
      playPending = false;
    }
  }
  function toggleSound() {
    if (disposed || sound.disabled) return;
    video.muted = !video.muted;
    syncControl();
    announcement.textContent = video.muted ? 'Sound off' : 'Sound on';
  }
  video.addEventListener('playing', () => {
    poster.hidden = true;
    needsGesture = false;
    syncControl();
  });
  video.addEventListener('error', () => {
    if (disposed) return;
    sound.disabled = true;
    const message = document.createElement('p');
    message.className = 'film-error';
    message.textContent = 'The film could not load. ';
    const link = document.createElement('a');
    link.href = film.url;
    link.textContent = 'Watch film ↗';
    message.append(link);
    frame.replaceChildren(message);
  });
  syncControl();
  frame.append(video, poster, sound, announcement);
  start();

  return {
    toggleSound,
    activateFilm() {
      if (disposed || sound.disabled) return;
      if (needsGesture) start();
      else toggleSound();
    },
    destroy() {
      disposed = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
      frame.replaceChildren();
    },
  };
}
