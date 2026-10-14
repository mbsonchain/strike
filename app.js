import { film, pages } from './content.js';
import { mountFilm, handleSoundShortcut } from './media.js';
import { createDiagnostics } from './diagnostics.js';

const app = document.querySelector('#app');
const diagnostics = new URLSearchParams(location.search).get('diagnose') === '1' ? createDiagnostics(app) : null;
const mobile = window.matchMedia('(max-width: 760px)');
let filmPlayer;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const logoMarkup = '<div class="masthead"><a class="site-logo" href="/" aria-label="Strikeout entrance"><img src="/assets/strikeout-s.png" alt="Strikeout" width="480" height="445"></a></div>';

function navigate(path) {
  const destination = new URL(path, location.origin);
  if (diagnostics) destination.searchParams.set('diagnose', '1');
  const next = `${destination.pathname}${destination.search}${destination.hash}`;
  if (`${location.pathname}${location.search}${location.hash}` !== next) history.pushState({}, '', next);
  render(true);
  window.scrollTo(0, 0);
}

function syncMedia() {
  const experience = app.querySelector('.experience');
  if (!experience) return;
  const show = mobile.matches || experience.dataset.view === 'video';
  if (show && !filmPlayer) filmPlayer = mountFilm(app.querySelector('.film-frame'), film, { onPlayError: diagnostics?.playError });
  filmPlayer?.setVisible(show);
  // The two sections remain stacked on mobile; there is no mobile view control.
  app.querySelector('.controls').hidden = mobile.matches;
}

function setView(view, updateHistory = true) {
  const experience = app.querySelector('.experience');
  if (!experience) return;
  experience.dataset.view = view;
  const catalog = view === 'catalog';
  app.querySelector('.view-switch').setAttribute('aria-checked', String(catalog));
  if (updateHistory) history.replaceState({}, '', catalog ? '/#catalog' : '/#video');
  syncMedia();
}

function render(focus = false) {
  filmPlayer?.destroy();
  filmPlayer = null;
  const slug = location.pathname === '/mobile-preview' ? '' : location.pathname.replace(/^\/+|\/+$/g, '');
  const page = pages.find(item => item.slug === slug);
  document.title = page ? `${page.title} — Strikeout` : 'Strikeout';
  if (page || slug) {
    app.innerHTML = `<section class="detail" aria-labelledby="page-title">
      ${logoMarkup}
      <div class="detail-content"><h1 id="page-title" tabindex="-1">${escapeHtml(page?.title || 'Not found')}</h1>
      <div class="detail-copy"><p>${escapeHtml(page ? page.body || 'Coming soon.' : 'This page could not be found.')}</p></div></div>
      <nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog" aria-label="Back to catalog">←</a></nav>
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
    ${logoMarkup}
    <div class="stage">
      <section class="film-panel" aria-label="Strikeout film" tabindex="-1"><div class="film-frame"></div>${film.caption ? `<p class="film-caption">${escapeHtml(film.caption)}</p>` : ''}</section>
      <nav class="catalog-panel" aria-label="Strikeout catalog"><div class="catalog-list">${pages.map(item => `<a class="catalog-row" href="/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</div></nav>
    </div>
    <nav class="controls" aria-label="View navigation">
      <button class="view-switch" role="switch" aria-label="Catalog view" aria-checked="${view === 'catalog'}"><span></span></button>
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
window.addEventListener('keydown', event => {
  handleSoundShortcut(event, filmPlayer, !mobile.matches && app.querySelector('.experience')?.dataset.view === 'video');
});
render();
