# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- Click the stationary S to enter the film view. A smaller S stays centered at the top and returns to the entrance.
- Desktop: a wordless switch at the bottom center changes between the smaller film and the five catalog rows.
- Mobile (760px and below): horizontal 16:9 film, then all five catalog rows, in one continuous view.
- On mobile, the bottom switch jumps between the visible film and catalog sections without hiding either.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with the top S and a back arrow. Page content is intentionally pending.
- Film autoplays muted, with native player controls hidden. Click/tap the film (or use the focused button with Enter/Space) to toggle sound. Switching to the desktop catalog mutes and pauses; returning resumes muted at the same point. Navigation destroys the old player.
- Autoplay denial leaves a play icon; player errors provide a link to watch the film. YouTube can still display branding because its branding suppression parameters are no longer supported. A hosted MP4/WebM can replace YouTube for an entirely clean player.

## Content

`content.js` contains the original Ghost Town YouTube URL recovered from the saved site's archive template. Edit it to change the video URL, title, optional caption, and individual page copy. YouTube, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.”

## Preview

No build dependencies. The YouTube IFrame API loads on entry to the film. Run `npm run build`, then `npm run dev`. Open the printed local URL. `/mobile-preview` shows the real site inside a 390 × 844 frame. Run `npm run check` for syntax validation and `npm test` for playback lifecycle tests. Vercel builds the static `dist` output.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.
