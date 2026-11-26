export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const back = '<nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog" aria-label="Back to catalog">←</a></nav>';
const frameUrl = 'https://desertformal.com/embed/network';
const archiveFolders = numbers => `<div class="archive-folders" aria-label="Catalog archives ${numbers[0]}–${numbers.at(-1)}">${numbers.map(n => `<details class="archive-folder"><summary><span class="folder-shape" aria-hidden="true"></span><span>Archive ${String(n).padStart(2, '0')}</span></summary><p>Nothing archived yet.</p></details>`).join('')}</div>`;

export function noteMarkup(page, assetDirectory = new URL('./assets/notes/', import.meta.url).pathname) {
  return `<section class="note-page" aria-labelledby="page-title">
    <h1 id="page-title" class="sr-only" tabindex="-1">${escapeHtml(page.title)}</h1>
    <img class="note-art" src="${assetDirectory}${page.slug}.svg" alt="${escapeHtml(page.note)}">
    ${back}
  </section>`;
}

export function pageMarkup(page, logo, isMobile = false) {
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
