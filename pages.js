export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const logoMarkup = '<header class="masthead"><a class="site-logo" href="/" aria-label="Strikeout entrance"><img src="/assets/strikeout-s.png" alt="Strikeout" width="484" height="435"></a></header>';
const back = '<nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog" aria-label="Back to catalog">←</a></nav>';
const frameUrl = 'https://desertformal.com/embed/network';
const archiveFolders = numbers => `<div class="archive-folders" aria-label="Catalog archives ${numbers[0]}–${numbers.at(-1)}">${numbers.map(n => `<details class="archive-folder"><summary><span class="folder-shape" aria-hidden="true"></span><span>Archive ${String(n).padStart(2, '0')}</span></summary><p>Nothing archived yet.</p></details>`).join('')}</div>`;

export function noteMarkup(page, assetDirectory = new URL('./assets/notes/', import.meta.url).pathname) {
  const { opening, continuation, closing } = page.note;
  const scenery = page.scenery && `<picture class="note-scenery" aria-hidden="true">
    ${page.scenery.portrait ? `<source media="(orientation: portrait)" srcset="${escapeHtml(page.scenery.portrait)}">` : ''}
    <img src="${escapeHtml(page.scenery.image)}" alt="" fetchpriority="high">
  </picture>`;
  const flowers = page.slug === 'about'
    ? '<div class="note-flowers" aria-hidden="true"><span></span><span></span><span></span></div>' : '';
  const signature = `<img class="note-signature" src="${assetDirectory}${closing.art}.svg" alt="${escapeHtml(closing.text)}">`;
  return `${scenery || ''}<section class="note-page" aria-labelledby="page-title">
    ${logoMarkup}
    <h1 id="page-title" class="sr-only" tabindex="-1">${escapeHtml(page.title)}</h1>
    ${flowers}
    <div class="note-composition">
      <img class="note-opening" src="${assetDirectory}${page.slug}.svg" alt="${escapeHtml(opening)}">
      <img class="note-continuation" src="${assetDirectory}${page.slug}-continuation.svg" alt="${escapeHtml(continuation)}">
    </div>
    <div class="note-ending">${closing.href ? `<a class="note-site" href="${escapeHtml(closing.href)}" target="_blank" rel="noopener">${signature}<span class="sr-only"> (opens in a new tab)</span></a>` : signature}</div>
    ${back}
  </section>`;
}

export function pageMarkup(page, logo = logoMarkup, isMobile = false) {
  if (page.note) return noteMarkup(page);
  if (page.slug === 'catalog') {
    if (isMobile) {
      return `<section class="detail catalog-unavailable" aria-labelledby="page-title">${logo}
        <div class="catalog-unavailable-copy"><h1 id="page-title" tabindex="-1">404</h1><p>catalog available on desktop only</p></div>${back}</section>`;
    }
    return `<section class="detail catalog-detail" aria-labelledby="page-title">${logo}
      <h1 id="page-title" class="sr-only" tabindex="-1">Catalog</h1>
      <div class="catalog-content">
        ${archiveFolders([1, 2, 3])}
        <iframe class="catalog-window" title="Desert / FORMAL catalog" src="${frameUrl}" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        ${archiveFolders([4, 5, 6])}
      </div>${back}</section>`;
  }
  return null;
}
