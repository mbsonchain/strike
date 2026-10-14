import test from 'node:test';
import assert from 'node:assert/strict';
import { mountFilm, videoSource, handleSoundShortcut } from '../media.js';

const origin = 'https://www.strikeout.us';
const film = { url: 'https://youtu.be/cUV2OUpyYvk', title: 'Ghost Town' };

// These are isolated player-adapter tests, not browser/playback tests.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.dataset = {}; this.events = {}; this.calls = []; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, fn) { this.events[name] = fn; }
  play() { this.calls.push('play'); return Promise.resolve(); }
  pause() { this.calls.push('pause'); }
  load() { this.calls.push('load'); }
}

function setup(t, loadPlayer) {
  const oldDocument = global.document;
  global.document = { createElement: tag => new Element(tag) };
  t.after(() => { global.document = oldDocument; });
  const instances = [];
  const YT = { Player: class {
    constructor(iframe, { events }) { this.iframe = iframe; this.events = events; this.calls = []; instances.push(this); }
    mute() { this.calls.push('mute'); }
    unMute() { this.calls.push('unmute'); }
    setVolume(value) { this.calls.push(`volume:${value}`); }
    playVideo() { this.calls.push('play'); }
    pauseVideo() { this.calls.push('pause'); }
    destroy() { this.calls.push('destroy'); }
  } };
  const frame = new Element('div');
  const controller = mountFilm(frame, film, { origin, loadPlayer: loadPlayer || (() => Promise.resolve(YT)) });
  t.after(() => controller.destroy());
  return { frame, controller, instances, YT };
}

test('embed hides controls, autoplays muted inline, and uses the real page origin', () => {
  const source = videoSource(film.url, origin);
  const url = new URL(source.url);
  assert.equal(url.hostname, 'www.youtube-nocookie.com');
  for (const [key, value] of Object.entries({ origin, autoplay: '1', mute: '1', controls: '0', playsinline: '1', enablejsapi: '1' })) assert.equal(url.searchParams.get(key), value);
  assert.equal(videoSource('javascript:alert(1)', origin), null);
  assert.equal(videoSource('https://youtube.com.evil.test/watch?v=cUV2OUpyYvk', origin), null);
});

test('ready starts muted; two clicks unmute and mute without replacing the player', async t => {
  const { frame, controller, instances } = setup(t);
  await Promise.resolve();
  const player = instances[0];
  const button = frame.children.find(node => node.tag === 'button');
  assert.equal(button.disabled, true);
  player.events.onReady({ target: player });
  assert.deepEqual(player.calls, ['mute', 'play']);
  assert.equal(button.disabled, false);
  button.events.click();
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.deepEqual(player.calls.slice(-3), ['volume:100', 'unmute', 'play']);
  button.events.click();
  assert.equal(button.attributes['aria-pressed'], 'false');
  assert.deepEqual(player.calls.slice(-2), ['mute', 'play']);
  assert.equal(instances.length, 1);
  controller.destroy();
  assert.equal(player.calls.at(-1), 'destroy');
  assert.deepEqual(frame.children, []);
});

test('catalog pauses and silences playback; returning resumes the same player muted', async t => {
  const { controller, instances, frame } = setup(t);
  await Promise.resolve();
  const player = instances[0];
  player.events.onReady({ target: player });
  frame.children.find(node => node.tag === 'button').events.click();
  controller.setVisible(false);
  assert.deepEqual(player.calls.slice(-2), ['mute', 'pause']);
  player.events.onStateChange({ data: 1 });
  assert.deepEqual(player.calls.slice(-2), ['mute', 'pause']);
  controller.setVisible(true);
  assert.equal(player.calls.at(-1), 'play');
  assert.equal(frame.children.find(node => node.tag === 'button').attributes['aria-pressed'], 'false');
  assert.equal(instances.length, 1);
});

test('switching away before player ready does not start hidden playback', async t => {
  const { controller, instances } = setup(t);
  controller.setVisible(false);
  await Promise.resolve();
  const player = instances[0];
  player.events.onReady({ target: player });
  assert.deepEqual(player.calls, ['mute', 'pause']);
});

test('leaving before the SDK loads prevents an orphan player from starting', async t => {
  let resolveSDK;
  const sdk = new Promise(resolve => { resolveSDK = resolve; });
  const { controller, instances, YT } = setup(t, () => sdk);
  controller.destroy();
  resolveSDK(YT);
  await Promise.resolve();
  assert.equal(instances.length, 0);
});

test('autoplay denial exposes a play action, and a user click retries with sound', async t => {
  const { frame, instances } = setup(t);
  await Promise.resolve();
  const player = instances[0];
  player.events.onReady({ target: player });
  player.events.onAutoplayBlocked();
  assert.equal(frame.dataset.blocked, 'true');
  const button = frame.children.find(node => node.tag === 'button');
  assert.equal(button.attributes['aria-label'], 'Play film and toggle sound');
  button.events.click();
  assert.deepEqual(player.calls.slice(-3), ['volume:100', 'unmute', 'play']);
  player.events.onStateChange({ data: 1 });
  assert.equal(frame.dataset.blocked, 'false');
});

test('SDK failure gives a working external film link instead of an inert frame', async t => {
  const { frame } = setup(t, () => Promise.reject(new Error('Offline')));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(frame.children[0].children[0].href, 'https://www.youtube.com/watch?v=cUV2OUpyYvk');
});

test('direct video defaults to sound on; click and Space toggle it and catalog preserves the choice', t => {
  setup(t);
  const frame = new Element('div');
  const controller = mountFilm(frame, { ...film, url: 'https://media.example/ghost-town.mp4' }, { origin });
  const video = frame.children.find(node => node.tag === 'video');
  const button = frame.children.find(node => node.tag === 'button');
  assert.equal(video.muted, false);
  assert.equal(video.defaultMuted, false);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.equal(video.autoplay, true);
  assert.equal(video.playsInline, true);
  assert.notEqual(video.controls, true);
  video.events.playing();
  video.calls.length = 0;
  button.events.click();
  assert.equal(video.muted, true);
  assert.equal(button.attributes['aria-pressed'], 'false');
  assert.deepEqual(video.calls, []);
  controller.setVisible(false);
  assert.equal(video.muted, true);
  assert.equal(video.calls.at(-1), 'pause');
  controller.setVisible(true);
  assert.equal(video.muted, true);
  video.events.playing();
  video.calls.length = 0;
  handleSoundShortcut({ code: 'Space', preventDefault() {} }, controller, true);
  assert.equal(video.muted, false);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.deepEqual(video.calls, []);
  controller.setVisible(false);
  assert.equal(video.muted, true);
  controller.setVisible(true);
  assert.equal(video.muted, false);
  controller.destroy();
  assert.deepEqual(video.calls.slice(-2), ['pause', 'load']);
});

test('direct video cannot restart in the hidden catalog after a delayed playing event', t => {
  setup(t);
  const frame = new Element('div');
  const controller = mountFilm(frame, { ...film, url: 'https://media.example/ghost-town.mp4' }, { origin });
  const video = frame.children.find(node => node.tag === 'video');
  controller.setVisible(false);
  video.events.playing();
  assert.equal(video.calls.at(-1), 'pause');
  assert.equal(video.muted, true);
  controller.setVisible(true);
  assert.equal(video.calls.at(-1), 'play');
  assert.equal(video.muted, false);
  video.events.playing();
  controller.toggleSound();
  assert.equal(video.muted, true);
  controller.destroy();
});

test('native autoplay denial can be retried, while cancelled play requests are harmless', async t => {
  setup(t);
  const frame = new Element('div');
  const controller = mountFilm(frame, { ...film, url: 'https://media.example/ghost-town.mp4' }, { origin });
  const video = frame.children.find(node => node.tag === 'video');
  const button = frame.children.find(node => node.tag === 'button');
  video.events.playing();
  video.play = () => Promise.reject(Object.assign(new Error('Interrupted'), { name: 'AbortError' }));
  controller.setVisible(false);
  controller.setVisible(true);
  await Promise.resolve();
  assert.equal(frame.dataset.blocked, 'false');
  video.play = () => Promise.reject(Object.assign(new Error('Autoplay denied'), { name: 'NotAllowedError' }));
  controller.setVisible(false);
  controller.setVisible(true);
  await Promise.resolve();
  assert.equal(frame.dataset.blocked, 'true');
  assert.equal(video.muted, false);
  assert.equal(button.attributes['aria-label'], 'Play film');
  video.play = () => { video.calls.push('play'); return Promise.resolve(); };
  button.events.click();
  assert.equal(video.calls.at(-1), 'play');
  assert.equal(video.muted, false);
  assert.equal(button.attributes['aria-pressed'], 'true');
  video.events.playing();
  assert.equal(frame.dataset.blocked, 'false');
  assert.equal(button.attributes['aria-label'], 'Film sound');
  controller.destroy();
});

test('sound clicks while playing do not resend playback commands or reveal overlays', async t => {
  const { frame, instances, controller } = setup(t);
  await Promise.resolve();
  const player = instances[0];
  player.events.onReady({ target: player });
  player.events.onStateChange({ data: 1 });
  player.calls.length = 0;
  const button = frame.children.find(node => node.tag === 'button');
  button.events.click();
  assert.deepEqual(player.calls, ['volume:100', 'unmute']);
  controller.toggleSound();
  assert.equal(player.calls.at(-1), 'mute');
  assert.ok(!player.calls.includes('play'));
});

test('desktop Space toggles sound once without scrolling; shortcuts leave other controls alone', () => {
  let toggles = 0, prevented = 0;
  const controller = { toggleSound() { toggles++; } };
  const event = { code: 'Space', target: { closest: () => null }, preventDefault() { prevented++; } };
  handleSoundShortcut(event, controller, true);
  assert.equal(toggles, 1);
  assert.equal(prevented, 1);
  handleSoundShortcut({ ...event, repeat: true }, controller, true);
  assert.equal(toggles, 1);
  assert.equal(prevented, 2);
  for (const changed of [{ ctrlKey: true }, { shiftKey: true }, { altKey: true }, { metaKey: true }, { defaultPrevented: true }, { target: { closest: () => ({}) } }, { code: 'Enter' }]) handleSoundShortcut({ ...event, ...changed }, controller, true);
  handleSoundShortcut(event, controller, false);
  handleSoundShortcut(event, null, true);
  assert.equal(toggles, 1);
  assert.equal(prevented, 2);
});
