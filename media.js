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

  const sound = document.createElement('button');
  sound.className = 'film-sound';
  sound.type = 'button';
  sound.setAttribute('aria-label', 'Film sound');
  sound.setAttribute('aria-pressed', 'false');
  const announcement = document.createElement('span');
  announcement.className = 'sr-only';
  announcement.setAttribute('aria-live', 'polite');

  // Only a browser-denied autoplay attempt exposes this separate retry control.
  const retry = document.createElement('button');
  retry.className = 'film-retry';
  retry.type = 'button';
  retry.textContent = '▶';
  retry.setAttribute('aria-label', 'Play film');
  retry.hidden = true;
  let disposed = false;
  function start() {
    retry.hidden = true;
    video.play().catch(error => {
      if (!disposed && error.name === 'NotAllowedError') retry.hidden = false;
    });
  }
  retry.addEventListener('click', start);
  video.addEventListener('playing', () => { retry.hidden = true; });
  video.addEventListener('error', () => {
    if (disposed) return;
    sound.disabled = true;
    retry.hidden = true;
    const message = document.createElement('p');
    message.className = 'film-error';
    message.textContent = 'The film could not load. ';
    const link = document.createElement('a');
    link.href = film.url;
    link.textContent = 'Watch film ↗';
    message.append(link);
    frame.replaceChildren(message);
  });
  frame.append(video, sound, retry, announcement);
  start();

  return {
    toggleSound() {
      if (disposed) return;
      video.muted = !video.muted;
      sound.setAttribute('aria-pressed', String(!video.muted));
      announcement.textContent = video.muted ? 'Sound off' : 'Sound on';
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
