import test from 'node:test';
import assert from 'node:assert/strict';
import { mountFilm, handleSoundShortcut } from '../media.js';

const film = { url: 'https://media.example/ghost-town.mp4', title: 'Ghost Town', poster: '/poster.jpg' };

// Isolated browser API fakes; real autoplay and navigation are also checked in the browser.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.events = {}; this.calls = []; this.currentTime = 0; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { this.calls.push(`remove:${name}`); delete this.attributes[name]; }
  addEventListener(name, fn) { this.events[name] = fn; }
  play() { this.calls.push('play'); return this.playResult || Promise.resolve(); }
  pause() { this.calls.push('pause'); }
  load() { this.calls.push('load'); }
}
function setup(t, playResult) {
  const oldDocument = global.document;
  global.document = { createElement(tag) {
    const element = new Element(tag);
    if (tag === 'video') element.playResult = playResult;
    return element;
  } };
  t.after(() => { global.document = oldDocument; });
  const frame = new Element('div');
  const controller = mountFilm(frame, film);
  const video = frame.children.find(node => node.tag === 'video');
  const sound = frame.children.find(node => node.className === 'film-sound');
  const poster = frame.children.find(node => node.className === 'film-poster');
  t.after(() => controller.destroy());
  return { frame, controller, video, sound, poster };
}

test('native film starts muted, inline and looping without controls or third-party players', t => {
  const { video, frame, sound, poster } = setup(t);
  assert.equal(video.src, film.url);
  assert.equal(video.poster, film.poster);
  assert.equal(video.autoplay, true);
  assert.equal(video.muted, true);
  assert.equal(video.defaultMuted, true);
  assert.equal(video.playsInline, true);
  assert.equal(video.loop, true);
  assert.equal(video.controls, false);
  assert.equal(poster.src, film.poster);
  assert.ok(!poster.hidden);
  assert.deepEqual(frame.children.filter(node => node.tag === 'button'), [sound]);
  assert.ok(!sound.textContent && !sound.children.length);
  assert.equal(sound.attributes['aria-pressed'], 'false');
  assert.deepEqual(video.calls, ['play']);
  assert.ok(!frame.children.some(node => ['iframe', 'script'].includes(node.tag)));
});

test('sound changes never play, pause, seek, reload or replace the film, even before playing or while paused', t => {
  const { controller, video, sound, frame } = setup(t);
  const originalNodes = [...frame.children];
  for (const state of ['loading', 'playing', 'paused', 'buffering']) {
    if (state === 'playing') video.events.playing();
    video.paused = state === 'paused';
    video.currentTime = 123.456;
    video.calls.length = 0;
    controller.toggleSound();
    assert.equal(video.muted, false, state);
    assert.equal(sound.attributes['aria-pressed'], 'true');
    controller.toggleSound();
    assert.equal(video.muted, true, state);
    assert.equal(sound.attributes['aria-pressed'], 'false');
    assert.equal(video.currentTime, 123.456, state);
    assert.equal(video.src, film.url, state);
    assert.deepEqual(video.calls, [], state);
    assert.deepEqual(frame.children, originalNodes, state);
  }
});

test('sound follows the actual video mute setting instead of a second state variable', t => {
  const { controller, video } = setup(t);
  video.muted = false;
  controller.toggleSound();
  assert.equal(video.muted, true);
});

test('a blocked start keeps the original poster and accepts a tap on the unmarked film surface', async t => {
  const denied = Object.assign(new Error('Denied'), { name: 'NotAllowedError' });
  const { controller, frame, video, sound, poster } = setup(t, Promise.reject(denied));
  await Promise.resolve();
  assert.ok(!poster.hidden);
  assert.deepEqual(frame.children.filter(node => node.tag === 'button'), [sound]);
  assert.ok(!sound.textContent && !sound.children.length);
  assert.equal(sound.attributes['aria-label'], 'Start film');
  assert.ok(!('aria-pressed' in sound.attributes));
  video.calls.length = 0;
  controller.toggleSound();
  controller.toggleSound();
  assert.deepEqual(video.calls, []);
  video.playResult = Promise.reject(denied);
  controller.activateFilm();
  controller.activateFilm();
  assert.deepEqual(video.calls, ['play']);
  await Promise.resolve();
  assert.equal(sound.attributes['aria-label'], 'Start film');
  video.playResult = Promise.resolve();
  controller.activateFilm();
  assert.deepEqual(video.calls, ['play', 'play']);
  assert.equal(video.muted, true);
  video.events.playing();
  assert.equal(poster.hidden, true);
  assert.equal(sound.attributes['aria-label'], 'Film sound');
  assert.equal(sound.attributes['aria-pressed'], 'false');
  controller.activateFilm();
  assert.equal(video.muted, false);
  assert.deepEqual(video.calls, ['play', 'play']);
});

test('leaving the film releases its source; a pending rejection cannot revive it', async t => {
  let rejectPlay;
  const { controller, video, frame, sound } = setup(t, new Promise((resolve, reject) => { rejectPlay = reject; }));
  controller.destroy();
  assert.deepEqual(video.calls, ['play', 'pause', 'remove:src', 'load']);
  rejectPlay(Object.assign(new Error('Denied'), { name: 'NotAllowedError' }));
  await Promise.resolve();
  assert.deepEqual(frame.children, []);
  assert.equal(sound.attributes['aria-label'], 'Film sound');
  video.calls.length = 0;
  controller.toggleSound();
  controller.activateFilm();
  assert.deepEqual(video.calls, []);
});

test('a media failure leaves a working direct film link', t => {
  const { video, frame } = setup(t);
  video.events.error();
  assert.equal(frame.children.length, 1);
  assert.equal(frame.children[0].className, 'film-error');
  assert.equal(frame.children[0].children[0].href, film.url);
});

test('desktop Space toggles once without scrolling and leaves navigation controls alone', () => {
  let toggles = 0, prevented = 0;
  const controller = { toggleSound() { toggles++; } };
  const event = { code: 'Space', target: { closest: () => null }, preventDefault() { prevented++; } };
  handleSoundShortcut(event, controller, true);
  assert.equal(toggles, 1);
  assert.equal(prevented, 1);
  handleSoundShortcut({ ...event, repeat: true }, controller, true);
  assert.equal(toggles, 1);
  for (const changed of [{ ctrlKey: true }, { shiftKey: true }, { altKey: true }, { metaKey: true }, { defaultPrevented: true }, { target: { closest: () => ({}) } }, { code: 'Enter' }]) handleSoundShortcut({ ...event, ...changed }, controller, true);
  handleSoundShortcut(event, controller, false);
  assert.equal(toggles, 1);
});
