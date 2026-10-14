import { film, pages } from './content.js';
import { mountFilm, handleSoundShortcut } from './media.js';

const app = document.querySelector('#app');
const mobile = window.matchMedia('(max-width: 760px)');
let filmPlayer;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const logoMarkup = '<div class="masthead"><a class="site-logo" href="/" aria-label="Strikeout entrance"><img src="/assets/strikeout-s.png" alt="Strikeout" width="480" height="445"></a></div>';

function scrollToContent() {
  // Mobile sky continues above/below the content so Safari has image pixels behind its bars.
  window.scrollTo({ top: app.offsetTop, left: 0, behavior: 'instant' });
}

function navigate(path) {
  const destination = new URL(path, location.origin);
  const next = `${destination.pathname}${destination.search}${destination.hash}`;
  if (`${location.pathname}${location.search}${location.hash}` !== next) history.pushState({}, '', next);
  render(true);
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
    if (focus) app.querySelector('.enter').focus({ preventScroll: true });
    return;
  }
  const view = location.hash === '#catalog' ? 'catalog' : 'video';
  app.innerHTML = `<div class="experience" data-view="${view}">
    ${logoMarkup}
    <div class="stage">
      <section class="film-panel" aria-label="Strikeout film" tabindex="-1"><div class="film-frame"></div></section>
      <nav class="catalog-panel" aria-label="Strikeout catalog"><div class="catalog-list">${pages.map(item => `<a class="catalog-row" href="/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</div></nav>
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
    navigate(`${control.pathname}${control.hash}`);
  } else if (control?.matches('.enter')) {
    navigate('/#video');
  } else if (control?.matches('.view-switch')) {
    setView(app.querySelector('.experience').dataset.view === 'video' ? 'catalog' : 'video');
  } else if (!control || control.matches('.film-sound')) {
    filmPlayer?.toggleSound();
  }
});
window.addEventListener('popstate', () => { render(true); scrollToContent(); });
window.addEventListener('hashchange', () => { render(); scrollToContent(); });
mobile.addEventListener('change', scrollToContent);
window.addEventListener('pageshow', scrollToContent);
window.addEventListener('resize', scrollToContent);
window.addEventListener('keydown', event => {
  handleSoundShortcut(event, filmPlayer, !mobile.matches);
});
render();
scrollToContent();
