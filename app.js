import { film, menuPages, pages } from './content.js';
import { mountFilm, handleSoundShortcut } from './media.js';
import { pageMarkup, escapeHtml, logoMarkup } from './pages.js';
import { scrollToContent } from './viewport.js';

const app = document.querySelector('#app');
const browserTheme = document.querySelector('meta[name="theme-color"]');
const homeColor = browserTheme.content;
const mobile = window.matchMedia('(max-width: 760px)');
let filmPlayer;
const markAttribute = page => page?.mark ? ` data-mark="${escapeHtml(page.mark)}"` : '';

function navigate(path, focus = true) {
  const destination = new URL(path, location.origin);
  const next = `${destination.pathname}${destination.search}${destination.hash}`;
  if (`${location.pathname}${location.search}${location.hash}` !== next) history.pushState({}, '', next);
  render(focus);
  scrollToContent();
}

function setView(view, updateHistory = true) {
  const experience = app.querySelector('.experience');
  if (!experience) return;
  experience.dataset.view = view;
  const catalog = view === 'catalog';
  app.querySelector('.view-switch').setAttribute('aria-checked', String(catalog));
  if (updateHistory) history.replaceState({}, '', catalog ? '/#catalog' : '/#video');
}

function render(focus = false) {
  const slug = location.pathname === '/mobile-preview' ? '' : location.pathname.replace(/^\/+|\/+$/g, '');
  // Hash navigation changes the view, never the running video element.
  if (!slug && ['#video', '#catalog'].includes(location.hash) && app.querySelector('.experience')) {
    setView(location.hash.slice(1), false);
    return;
  }
  filmPlayer?.destroy();
  filmPlayer = null;
  const page = pages.find(item => item.slug === slug);
  document.documentElement.style.setProperty('--note-color', page?.backgroundColor || '');
  browserTheme.content = page?.backgroundColor || homeColor;
  browserTheme.media = page?.scenery ? 'not all' : 'all';
  document.body.dataset.page = page?.slug || '';
  document.body.toggleAttribute('data-note', Boolean(page?.note));
  document.title = page ? `${page.title} — Strikeout` : 'Strikeout';
  if (page || slug) {
    app.innerHTML = (page && pageMarkup(page, logoMarkup, mobile.matches)) || `<section class="detail" aria-labelledby="page-title">
      ${logoMarkup}
      <div class="detail-content"><h1 id="page-title" tabindex="-1">Not found</h1>
      <div class="detail-copy"><p>This page could not be found.</p></div></div>
      <nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog" aria-label="Back to catalog">←</a></nav>
    </section>`;
    if (focus) app.querySelector('h1').focus({ preventScroll: true });
    return;
  }
  if (!['#video', '#catalog'].includes(location.hash)) {
    app.innerHTML = '<header class="entrance" aria-label="Strikeout"><button class="enter" aria-label="Enter Strikeout"><img src="/assets/strikeout-s.png" alt="Strikeout S" width="484" height="435"></button></header>';
    if (focus) app.querySelector('.enter').focus({ preventScroll: true });
    return;
  }
  const view = location.hash === '#catalog' ? 'catalog' : 'video';
  app.innerHTML = `<div class="experience" data-view="${view}">
    ${logoMarkup}
    <div class="stage">
      <section class="film-panel" aria-label="Strikeout film" tabindex="-1"><div class="film-frame"></div></section>
      <nav class="catalog-panel" aria-label="Strikeout catalog"><div class="catalog-list">${menuPages.map(item => `<a class="catalog-row" data-section="${item.slug}"${markAttribute(item)} href="/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</div></nav>
    </div>
    <nav class="controls" aria-label="View navigation">
      <button class="view-switch" role="switch" aria-label="Catalog view" aria-checked="${view === 'catalog'}"><span></span></button>
    </nav>
  </div>`;
  setView(view, false);
  filmPlayer = mountFilm(app.querySelector('.film-frame'), film);
  if (focus) (view === 'catalog' && !mobile.matches ? app.querySelector('.catalog-row') : app.querySelector('.film-panel')).focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const control = event.target.closest('a, button, input, textarea, select, summary, [contenteditable], [role="button"], [role="switch"]');
  if (control?.matches('a')) {
    if (control.origin !== location.origin || control.target || control.hasAttribute('download')) return;
    event.preventDefault();
    // Pointer taps preview a mobile section before opening it; keyboard links stay direct.
    if (mobile.matches && event.detail > 0 && control.matches('.catalog-row') && !control.hasAttribute('data-preview')) {
      app.querySelector('.catalog-row[data-preview]')?.removeAttribute('data-preview');
      control.setAttribute('data-preview', '');
      scrollToContent();
      return;
    }
    const focusDestination = !control.matches('.site-logo') || event.detail === 0;
    navigate(`${control.pathname}${control.hash}`, focusDestination);
  } else if (control?.matches('.enter')) {
    navigate('/#video');
  } else if (control?.matches('.view-switch')) {
    setView(app.querySelector('.experience').dataset.view === 'video' ? 'catalog' : 'video');
  } else if (control?.matches('.film-sound')) {
    filmPlayer?.activateFilm();
  } else if (!control) {
    filmPlayer?.toggleSound();
  }
});
window.addEventListener('popstate', () => { render(true); scrollToContent(); });
window.addEventListener('hashchange', () => { render(); scrollToContent(); });
mobile.addEventListener('change', () => {
  if (location.pathname.replace(/\/$/, '') === '/catalog') render();
  app.querySelector('.catalog-row[data-preview]')?.removeAttribute('data-preview');
  scrollToContent();
});
window.addEventListener('keydown', event => {
  handleSoundShortcut(event, filmPlayer, !mobile.matches);
});
render();
scrollToContent();
