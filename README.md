# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- Click the stationary S to enter the film view. A smaller S stays centered at the top and returns to the entrance.
- Desktop: a wordless switch at the bottom center changes between the smaller film and the five catalog rows.
- Mobile (760px and below): horizontal 16:9 film, then all five catalog rows, in one continuous view.
- Mobile has no toggle; film and catalog stay visible in one stacked layout.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with the top S and a back arrow. Page content is intentionally pending.
- Film autoplays muted, with native player controls hidden. Click/tap the film (or use the focused button with Enter/Space) to toggle sound. Switching to the desktop catalog mutes and pauses; returning resumes muted at the same point. Navigation destroys the old player.
- Desktop Space toggles film sound whenever the film view is active. Held keys do not repeat the action; links, buttons, form fields, modified shortcuts and mobile layouts retain their normal keyboard behavior.
- The YouTube iframe stays visible during startup, buffering and playback. Do not hide it behind a timer or a playback-event gate: that caused a black-screen regression when playback did not settle. Sound toggling while playing never resends a play command.
- Autoplay denial leaves a play icon; player errors provide a link to watch the film. YouTube's opening graphics may appear despite controls being disabled. A hosted MP4/WebM remains supported for an entirely unbranded player.
- YouTube chooses stream quality automatically and no longer supports forcing playback quality. Guaranteed maximum-resolution playback is pending the original full-quality MP4/WebM or its hosted URL. Do not add ineffective `setPlaybackQuality`/`suggestedQuality` calls. Reference: https://developers.google.com/youtube/iframe_api_revision_history

## Content

`content.js` contains the original Ghost Town YouTube URL recovered from the saved site's archive template. Edit it to change the video URL, title, optional caption, and individual page copy. YouTube, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.”

## Preview

No build dependencies. The YouTube IFrame API loads on entry to the film. Run `npm run build`, then `npm run dev`. Open the printed local URL. `/mobile-preview` shows the real site inside a 390 × 844 frame. Run `npm run check` for syntax validation and `npm test` for playback lifecycle tests. Vercel builds the static `dist` output.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.
