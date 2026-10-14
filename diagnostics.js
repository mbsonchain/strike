// Opt-in, device-local report. Nothing is sent to a server or saved between visits.
export function createDiagnostics(app) {
  const events = [];
  const start = performance.now();
  const record = (type, extra = {}) => {
    events.push({ at: Math.round(performance.now() - start), type, ...extra });
    if (events.length > 60) events.shift();
  };
  const state = video => video ? {
    paused: video.paused, muted: video.muted, time: video.currentTime,
    ready: video.readyState, network: video.networkState,
    autoplay: video.autoplay, inline: video.playsInline,
    error: video.error ? { code: video.error.code, message: video.error.message } : null,
    width: video.videoWidth, height: video.videoHeight,
  } : null;
  const watched = new WeakSet();
  const watch = () => {
    const video = app.querySelector('video');
    if (!video || watched.has(video)) return;
    watched.add(video);
    record('mounted', state(video));
    for (const name of ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'waiting', 'stalled', 'suspend', 'error', 'volumechange']) {
      video.addEventListener(name, () => record(name, state(video)));
    }
  };
  new MutationObserver(watch).observe(app, { childList: true, subtree: true });
  app.addEventListener('click', event => record('tap', { target: event.target.closest('button,a')?.getAttribute('aria-label') || event.target.tagName, active: navigator.userActivation?.isActive }), true);
  document.addEventListener('visibilitychange', () => record('visibility', { state: document.visibilityState }));

  function report() {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;top:0;left:0;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom);box-sizing:content-box';
    document.body.append(probe);
    const units = {};
    for (const unit of ['svh', 'dvh', 'lvh']) {
      probe.style.height = `100${unit}`;
      units[unit] = parseFloat(getComputedStyle(probe).height);
    }
    const safeArea = { top: getComputedStyle(probe).paddingTop, bottom: getComputedStyle(probe).paddingBottom };
    probe.remove();
    const geometry = element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { width: box.width, height: box.height, backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage, backgroundSize: style.backgroundSize };
    };
    return {
      release: document.querySelector('meta[name="strikeout-release"]')?.content,
      browser: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight, visualHeight: visualViewport?.height, visualTop: visualViewport?.offsetTop, screenHeight: screen.height, scale: devicePixelRatio, scrollY, ...units, safeArea },
      document: geometry(document.documentElement), body: geometry(document.body),
      video: state(app.querySelector('video')), visibility: document.visibilityState,
      events,
    };
  }
  const panel = document.createElement('aside');
  panel.setAttribute('aria-label', 'Safari diagnostic report');
  panel.style.cssText = 'position:fixed;z-index:99;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));max-width:calc(100vw - 20px);font:14px/1.4 system-ui;color:#080a0d;background:transparent;padding:10px 14px;border-radius:0';
  panel.innerHTML = '<button type="button" style="color:inherit;background:transparent;border:0;padding:0">Copy Safari report</button><span role="status"></span><textarea aria-label="Safari report" hidden readonly style="display:block;width:260px;height:100px;margin-top:8px;background:transparent;color:inherit"></textarea>';
  const button = panel.querySelector('button');
  button.addEventListener('click', async () => {
    const text = JSON.stringify(report());
    const fallback = panel.querySelector('textarea');
    fallback.value = text;
    fallback.hidden = false;
    try {
      await navigator.clipboard.writeText(text);
      panel.querySelector('[role="status"]').textContent = ' — copied';
    } catch {
      fallback.select();
      panel.querySelector('[role="status"]').textContent = ' — select and copy below';
    }
  });
  document.body.append(panel);
  return { playError: error => record('play-rejected', error) };
}
