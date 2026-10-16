import { dopo } from './content.js';

const back = '<nav class="controls" aria-label="Page navigation"><a class="back" href="/#catalog" aria-label="Back to catalog">←</a></nav>';
const frameUrl = new URL('./catalog-frame.html', import.meta.url).pathname;

export function pageMarkup(page, logo, escape) {
  if (page.slug === 'dopo') {
    return `<section class="dopo-page" role="button" tabindex="0" aria-label="Dopo. Click to change color and read more." data-dopo-index="0">
      <h1 id="page-title" class="sr-only">Dopo</h1>
      <div class="dopo-content"><img class="dopo-logo" src="/assets/dopo-logo.png" alt="Dopo" width="400" height="159">
        <div class="dopo-copy" aria-live="polite"><p class="dopo-desktop-copy">${escape(dopo.desktop[0])}</p><p class="dopo-mobile-copy">${escape(dopo.mobile[0])}</p></div>
      </div>
    </section><div class="dopo-navigation">${back}</div>`;
  }
  if (page.slug === 'formal') {
    return `<section class="detail formal-page" aria-labelledby="page-title">${logo}<h1 id="page-title" class="sr-only" tabindex="-1">Formal</h1><div class="formal-space"></div>${back}</section>`;
  }
  if (page.slug === 'catalog') {
    return `<section class="detail catalog-detail" aria-labelledby="page-title">${logo}
      <h1 id="page-title" class="sr-only" tabindex="-1">Catalog</h1>
      <div class="catalog-content">
        <iframe class="catalog-window" title="Desert / FORMAL catalog" src="${frameUrl}"></iframe>
        <div class="archive-folders" aria-label="Catalog archives">${[1, 2, 3].map(n => `<details class="archive-folder"><summary><span class="folder-shape" aria-hidden="true"></span><span>Archive ${String(n).padStart(2, '0')}</span></summary><p>Nothing archived yet.</p></details>`).join('')}</div>
      </div>${back}</section>`;
  }
  return null;
}

export function cycleDopo(container) {
  const index = (Number(container.dataset.dopoIndex) + 1) % dopo.colors.length;
  container.dataset.dopoIndex = index;
  container.classList.toggle('dopo-dark-text', index === 1 || index === 2);
  document.body.style.setProperty('--dopo-color', dopo.colors[index]);
  container.querySelector('.dopo-desktop-copy').textContent = dopo.desktop[index];
  container.querySelector('.dopo-mobile-copy').textContent = dopo.mobile[index];
}
