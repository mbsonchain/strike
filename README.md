# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- Click the stationary S to enter the film view. A smaller S stays centered at the top and returns to the entrance.
- Desktop: a wordless switch at the bottom center changes between the smaller film and the five catalog rows.
- Mobile (760px and below): horizontal 16:9 film, then all five catalog rows, in one continuous view.
- Mobile has no toggle; film and catalog stay visible in one stacked layout.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with the top S and a back arrow. Page content is intentionally pending.
- Film autoplays muted, with native player controls hidden. Click/tap the film (or use the focused button with Enter/Space) to toggle sound. Switching to the desktop catalog mutes and pauses; returning resumes muted at the same point. Navigation destroys the old player. Delayed playback events cannot resume a hidden film.
- Desktop Space toggles film sound whenever the film view is active. Held keys do not repeat the action; links, buttons, form fields, modified shortcuts and mobile layouts retain their normal keyboard behavior.
- The direct film has only a static title and studio name at the top. No YouTube player or SDK loads for an MP4/WebM. The original movie's embedded still serves as its loading poster. Sound toggling while playing never resends a play command.
- Autoplay denial leaves a play action; player errors provide a link to watch the film. There is no pause button, timeline or bottom branding.
- The web copy keeps the supplied master’s 1920 × 1080 resolution and 24000/1001 frame rate. Its ProRes picture is encoded as H.264 (CRF 16, slow preset, 8-bit 4:2:0) with AAC stereo audio at 320 kb/s and MP4 fast-start metadata. This is a high-quality web conversion, not a lossless copy of the 10-bit ProRes master. The single MP4 has no automatic resolution downgrades.
- The legacy YouTube adapter remains available if a YouTube URL is configured later. Do not hide it behind a timer/playback-event visibility gate: that caused a black-screen regression. Its quality cannot be forced through supported API settings.

## Content

`content.js` contains the hosted Ghost Town film URL, accessible title, visible title/byline, poster and optional caption. Edit it to change the film and individual page copy. YouTube, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.” The original MOV and generated MP4 stay outside the Git repository; only the poster belongs in `assets`.

## Preview

No build dependencies. Run `npm run build`, then `npm run dev`. Open the printed local URL. `/mobile-preview` shows the real site inside a 390 × 844 frame. Run `npm run check` for syntax validation and `npm test` for playback lifecycle tests. Vercel builds the static `dist` output.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.
