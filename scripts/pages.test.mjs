import test from 'node:test';
import assert from 'node:assert/strict';
import {logoMarkup, pageMarkup} from '../pages.js';
import {menuPages} from '../content.js';

test('each section links home through its header and preserves its handwritten links', () => {
  const domains = {ssc: 'studentservicecorp.org', dopo: 'getdopo.com', formal: 'desertformal.com'};
  for (const page of menuPages) {
    const html = pageMarkup(page);
    assert.match(html, /<header class="masthead"><a class="site-logo" href="\/" aria-label="Strikeout entrance">/);
    assert.equal(html.match(/class="site-logo"/g).length, 1);
    const links = [...html.matchAll(/<a class="note-site" href="([^"]+)" target="_blank" rel="noopener"><img[^>]* alt="([^"]+)">/g)];
    assert.deepEqual(links.map(m => [m[1], m[2]]), domains[page.slug] ? [[`https://${domains[page.slug]}/`, domains[page.slug]]] : []);
    assert.match(html, /href="\/#catalog"/);
  }
});

test('desktop catalog loads the live source; mobile shows its notice without an iframe request', () => {
  const page = {slug: 'catalog'};
  const desktop = pageMarkup(page);
  assert.ok(desktop.includes(logoMarkup));
  assert.match(desktop, /<iframe[^>]+src="https:\/\/desertformal\.com\/embed\/network"/);
  assert.equal((desktop.match(/<details /g) || []).length, 6);
  const mobile = pageMarkup(page, logoMarkup, true);
  assert.ok(mobile.includes(logoMarkup));
  assert.match(mobile, />404<\/h1>/);
  assert.match(mobile, /catalog available on desktop only/);
  assert.doesNotMatch(mobile, /<iframe|desertformal\.com|<details/);
  assert.match(mobile, /href="\/#catalog"/);
});
