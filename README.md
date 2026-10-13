# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- Click the S to enter the film view.
- Desktop: use the switch under the film to show the five catalog rows.
- Mobile (760px and below): horizontal 16:9 film, then all five catalog rows, in one continuous view.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with Home and Back to catalog navigation. Page content is intentionally pending.
- Film playback stops when leaving the video view on desktop. No autoplay or sound on entry.

## Content

`content.js` contains the original Ghost Town YouTube URL recovered from the saved site's archive template. Edit it to change the video URL, title, optional caption, and individual page copy. YouTube, Vimeo, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.”

## Preview

No third-party dependencies. Run `npm run build`, then `npm run dev`. Open the printed local URL. Run `npm run check` for syntax validation. Vercel builds the static `dist` output; deploy this branch as a preview before merging to production.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.
