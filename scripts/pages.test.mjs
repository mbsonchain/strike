import test from 'node:test';
import assert from 'node:assert/strict';
import {pageMarkup} from '../pages.js';

test('desktop catalog loads the live source; mobile shows its notice without an iframe request', () => {
  const page = {slug: 'catalog'};
  const desktop = pageMarkup(page, '', String, false);
  assert.match(desktop, /<iframe[^>]+src="https:\/\/desertformal\.com\/embed\/network"/);
  assert.equal((desktop.match(/<details /g) || []).length, 6);
  const mobile = pageMarkup(page, '', String, true);
  assert.match(mobile, />404<\/h1>/);
  assert.match(mobile, /catalog available on desktop only/);
  assert.doesNotMatch(mobile, /<iframe|desertformal\.com|<details/);
  assert.match(mobile, /href="\/#catalog"/);
});
