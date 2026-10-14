# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- Click the stationary S to enter the film view. A smaller S stays centered at the top and returns to the entrance.
- Desktop: a wordless switch at the bottom center changes between the smaller film and the five catalog rows.
- Mobile (760px and below): logo, horizontal 16:9 film and all five catalog rows form one centered group. Film and catalog share a width capped at 520px; short screens scroll naturally. The sky is the document background, so it covers the complete page and mobile browser viewport changes.
- Catalog labels use the actual Articulat Heavy CF 900 face from the existing Adobe kit. That face is registered separately from regular Articulat CF, which only supplies 400/700. Normal letter spacing is preserved.
- Mobile has no toggle; film and catalog stay visible in one stacked layout.
- The film has no decorative border or outer focus outline. Programmatic focus on its section does not draw a white frame; keyboard users retain focus indicators on interactive controls. The phone preview also uses the sky without a pale surround, frame or preview header.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with the top S and a back arrow. Page content is intentionally pending.
- Film starts with sound enabled, with native player controls hidden. The entrance click starts playback in the same user gesture. Click/tap the playing film (or use the focused button with Enter/Space) to toggle sound. Switching to the desktop catalog mutes and pauses; returning resumes at the same point with the viewer's sound preference. Navigation destroys the old player. Delayed playback events cannot resume a hidden film.
- Desktop Space toggles film sound whenever the film view is active. Held keys do not repeat the action; links, buttons, form fields, modified shortcuts and mobile layouts retain their normal keyboard behavior.
- The direct film has no visible title, byline or player branding. Its accessible title remains. No YouTube player or SDK loads for an MP4/WebM. The original movie's embedded still serves as its loading poster. Sound toggling while playing never resends a play command.
- Browsers may block autoplay with sound, particularly when opening the film directly or in the mobile preview. Autoplay denial leaves the poster and a play action; the first tap retries with sound enabled instead of muting it. Player errors provide a link to watch the film. There is no pause button or timeline.
- The web copy keeps the supplied master’s 1920 × 1080 resolution and 24000/1001 frame rate. Its ProRes picture is encoded as H.264 (CRF 16, slow preset, 8-bit 4:2:0) with AAC stereo audio at 320 kb/s and MP4 fast-start metadata. This is a high-quality web conversion, not a lossless copy of the 10-bit ProRes master. The single MP4 has no automatic resolution downgrades.
- The legacy YouTube adapter remains available if a YouTube URL is configured later. Do not hide it behind a timer/playback-event visibility gate: that caused a black-screen regression. Its quality cannot be forced through supported API settings.

## Content

`content.js` contains the hosted Ghost Town film URL, accessible title, poster and optional caption. Edit it to change the film and individual page copy. YouTube, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.” The original MOV and generated MP4 stay outside the Git repository; only the poster belongs in `assets`.

## Preview

No build dependencies. Run `npm run build`, then `npm run dev`. Open the printed local URL. `/mobile-preview` shows the real site in a centered 390px-wide viewport, up to 844px tall, with a sky surround. On phones it fills the available screen. Run `npm run check` for syntax validation and `npm test` for playback lifecycle tests. Vercel builds the static `dist` output.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.
