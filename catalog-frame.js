// This isolated copy contains only the Desert / FORMAL network view.
const feed = document.querySelector('.desert-feed');
const switchButton = document.querySelector('.frame-switch');
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.closest('.frame-views')) {
    const view = button.dataset.view || (document.body.dataset.view === 'desert' ? 'formal' : 'desert');
    document.body.dataset.view = view;
    switchButton.setAttribute('aria-checked', String(view === 'formal'));
    document.querySelectorAll('[data-view]').forEach(item => {
      if (item.tagName === 'BUTTON') item.setAttribute('aria-pressed', String(item.dataset.view === view));
    });
  } else if (button.closest('.desert-steps')) {
    const entry = button.closest('.desert-entry');
    const destination = button === button.parentElement.firstElementChild ? entry.previousElementSibling : entry.nextElementSibling;
    if (!destination) return;
    feed.scrollTo({ top: destination.offsetTop - feed.offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
});
