import { film, pages } from './content.js';

const app = document.querySelector('#app');
const mobile = window.matchMedia('(max-width: 760px)');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function videoSource(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw, location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'youtube-nocookie.com'].includes(host) ? (url.searchParams.get('v') || url.pathname.split('/').pop()) : '';
    if (id && /^[\w-]{11}$/.test(id)) return { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` };
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const match = url.pathname.match(/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?\/?$/i);
      if (match) {
        const embed = new URL(`https://player.vimeo.com/video/${match[1]}`);
        const hash = url.searchParams.get('h') || match[2];
        if (hash) embed.searchParams.set('h', hash);
        return { kind: 'embed', url: embed.href };
      }
    }
    if (/\.(mp4|webm)$/i.test(url.pathname)) return { kind: 'file', url: url.href };
  } catch { /* An invalid configured URL leaves the intentional empty state. */ }
  return null;
}

function filmMarkup() {
  const source = videoSource(film.url);
  if (!source) return '<div class="film-empty"><p class="film-label">STRIKEOUT</p><p>Film to come</p></div>';
  if (source.kind === 'file') return `<video src="${escapeHtml(source.url)}" aria-label="${escapeHtml(film.title)}" controls playsinline preload="metadata"></video>`;
  return `<iframe src="${escapeHtml(source.url)}" title="${escapeHtml(film.title)}" allow="fullscreen; picture-in-picture; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

function navigate(path) {
  if (`${location.pathname}${location.hash}` !== path) history.pushState({}, '', path);
  render(true);
  window.scrollTo(0, 0);
}

function pauseFilm() {
  const video = app.querySelector('video');
  if (video) video.pause();
  const frame = app.querySelector('iframe');
  // Removing the source reliably stops both YouTube and Vimeo on desktop.
  if (frame) frame.removeAttribute('src');
}

function syncMedia() {
  const experience = app.querySelector('.experience');
  if (!experience) return;
  const show = mobile.matches || experience.dataset.view === 'video';
  const frame = app.querySelector('.film-frame');
  if (!show) pauseFilm();
  else if (!frame.dataset.loaded || frame.querySelector('iframe:not([src])')) {
    frame.innerHTML = filmMarkup();
    frame.dataset.loaded = 'true';
  }
}

function setView(view, updateHistory = true) {
  const experience = app.querySelector('.experience');
  if (!experience) return;
  experience.dataset.view = view;
  const catalog = view === 'catalog';
  app.querySelector('.view-switch').setAttribute('aria-checked', String(catalog));
  app.querySelectorAll('.view-label').forEach(label => label.classList.toggle('active', label.dataset.label === view));
  if (updateHistory) history.replaceState({}, '', catalog ? '/#catalog' : '/#video');
  syncMedia();
}

function render(focus = false) {
  const slug = location.pathname.replace(/^\/+|\/+$/g, '');
  const page = pages.find(item => item.slug === slug);
  document.title = page ? `${page.title} — Strikeout` : 'Strikeout';
  if (page || slug) {
    app.innerHTML = `<section class="detail" aria-labelledby="page-title">
      <div class="detail-content"><h1 id="page-title" tabindex="-1">${escapeHtml(page?.title || 'Not found')}</h1>
      <div class="detail-copy"><p>${escapeHtml(page ? page.body || 'Coming soon.' : 'This page could not be found.')}</p></div></div>
      <nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog">← Back to catalog</a><a class="home" href="/">Home</a></nav>
    </section>`;
    if (focus) app.querySelector('h1').focus({ preventScroll: true });
    return;
  }
  if (!['#video', '#catalog'].includes(location.hash)) {
    app.innerHTML = '<section class="entrance" aria-label="Strikeout"><button class="enter" aria-label="Enter Strikeout"><img src="/assets/strikeout-s.png" alt="Strikeout S" width="480" height="445"></button></section>';
    app.querySelector('.enter').addEventListener('click', () => navigate('/#video'));
    if (focus) app.querySelector('.enter').focus({ preventScroll: true });
    return;
  }
  const view = location.hash === '#catalog' ? 'catalog' : 'video';
  app.innerHTML = `<div class="experience" data-view="${view}">
    <div class="stage">
      <section class="film-panel" aria-label="Strikeout film" tabindex="-1"><div class="film-frame"></div>${film.caption ? `<p class="film-caption">${escapeHtml(film.caption)}</p>` : ''}</section>
      <nav class="catalog-panel" aria-label="Strikeout catalog"><div class="catalog-list">${pages.map(item => `<a class="catalog-row" href="/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</div></nav>
    </div>
    <nav class="controls" aria-label="View navigation">
      <div class="view-control"><span class="view-label" data-label="video">Video</span><button class="view-switch" role="switch" aria-label="Catalog view" aria-checked="${view === 'catalog'}"><span></span></button><span class="view-label" data-label="catalog">Catalog</span></div>
      <a class="home" href="/">Home</a>
    </nav>
  </div>`;
  app.querySelector('.view-switch').addEventListener('click', () => setView(app.querySelector('.experience').dataset.view === 'video' ? 'catalog' : 'video'));
  setView(view, false);
  if (focus) (view === 'catalog' && !mobile.matches ? app.querySelector('.catalog-row') : app.querySelector('.film-panel')).focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.origin !== location.origin) return;
  event.preventDefault();
  navigate(`${link.pathname}${link.hash}`);
});
window.addEventListener('popstate', () => render(true));
window.addEventListener('hashchange', () => render());
mobile.addEventListener('change', syncMedia);
render();
