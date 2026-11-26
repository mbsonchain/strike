export function scrollToContent() {
  // Center the visible sheet inside real document pixels above and below Safari's bars.
  document.documentElement.toggleAttribute('data-note-bleed', document.body.hasAttribute('data-note'));
  if (window.visualViewport?.scale > 1) return;
  const top = document.getElementById('app').offsetTop;
  if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, left: 0, behavior: 'instant' });
}

window.addEventListener('pageshow', scrollToContent);
window.addEventListener('resize', scrollToContent);
if (document.body.hasAttribute('data-note')) scrollToContent();
