import test from 'node:test';
import assert from 'node:assert/strict';
import {pageMarkup} from '../pages.js';
import {menuPages} from '../content.js';

test('only the three handwritten web addresses are links and they work in the static markup', () => {
  const domains = {ssc: 'studentservicecorp.org', dopo: 'getdopo.com', formal: 'desertformal.com'};
  for (const page of menuPages) {
    const html = pageMarkup(page, '');
    const links = [...html.matchAll(/<a class="note-site" href="([^"]+)" target="_blank" rel="noopener"><img[^>]* alt="([^"]+)">/g)];
    assert.deepEqual(links.map(m => [m[1], m[2]]), domains[page.slug] ? [[`https://${domains[page.slug]}/`, domains[page.slug]]] : []);
    assert.match(html, /href="\/#catalog"/);
  }
});

test('desktop catalog loads the live source; mobile shows its notice without an iframe request', () => {
  const page = {slug: 'catalog'};
  const desktop = pageMarkup(page, '', false);
  assert.match(desktop, /<iframe[^>]+src="https:\/\/desertformal\.com\/embed\/network"/);
  assert.equal((desktop.match(/<details /g) || []).length, 6);
  const mobile = pageMarkup(page, '', true);
  assert.match(mobile, />404<\/h1>/);
  assert.match(mobile, /catalog available on desktop only/);
  assert.doesNotMatch(mobile, /<iframe|desertformal\.com|<details/);
  assert.match(mobile, /href="\/#catalog"/);
});
