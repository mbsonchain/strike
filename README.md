# Strikeout

A static site using the original Strikeout sky photograph, S artwork and Articulat CF font. No framework or build dependencies.

## Experience

- The homepage opens with the stationary S. Clicking it opens the film, which automatically starts muted. Direct `/#video` visits also autoplay. The small S returns to the entrance.
- The native 1080p MP4 plays inline and loops. Clicking the film or the surrounding page only changes `video.muted`; it never requests playback, seeks, reloads or replaces the video. Desktop Space also toggles sound. Links and other controls retain their normal actions.
- Desktop has a wordless film/catalog switch. Switching views or changing between the film/catalog hashes preserves the video, its playback position and its sound setting. Playback continues in the catalog view. Opening a separate subpage or returning to the entrance releases the player.
- Mobile shows the logo, horizontal film and five catalog links together, with no view switch. Content is centered and stationary. The sky extends half a large viewport above and below the content, with a blue fallback; scrolling is locked while pinch zoom remains available. Compact screens use smaller spacing and film sizing.
- Studios, Dopo, Formal, Catalog and About have separate URLs. Their page copy is pending. Catalog labels use `articulat-cf` at weight 900 from the existing Adobe kit.
- Desktop catalog rows extend to both viewport edges without borders or divider lines. Mobile catalog taps first preview the section's highlight; a second tap on that same section opens it. Selecting another row switches the preview. Returning from a subpage or crossing the desktop/mobile breakpoint clears the selection. Desktop clicks and keyboard activation open links directly.
- No visible film title, native controls, YouTube integration or white focus rectangles. The transparent film button remains keyboard accessible. If device settings deny muted autoplay, a separate play control allows retry; ordinary sound taps never run retry logic. Media errors expose a direct film link.

## Content and media

`content.js` contains the hosted native video URL, accessible title, poster and catalog entries. Full movies stay outside Git. The web copy preserves the supplied master's 1920 × 1080 resolution and 24000/1001 frame rate, using H.264 CRF 16 with AAC 320 kb/s audio and fast-start metadata. There are no automatic resolution downgrades. The original master and its opening frames are unchanged.

The film is served directly from Cloudflare R2 through `media.strikeout.us`, outside Vercel Blob and Vercel's video transfer usage. The website remains on Vercel. R2 outgoing transfer is free; storage and request allowances still apply. Use versioned object names, `video/mp4`, long-lived immutable caching and byte-range delivery. Upload credentials are temporary and never included in the site or repository.

## Development and verification

Run `npm run build`, then `npm run dev`. Run `npm run check` and `npm test` for syntax, playback invariants and complete-release checks.

Local previews always replace the hosted film URL with `/__local-film.mp4`. The development server streams `../media/strikeout/ghost-town-1080p.mp4`, or the path specified by `LOCAL_FILM_PATH`, with byte-range support. If that file is missing, playback stays unavailable locally; it never falls back to the hosted film. Keep full movies outside Git and outside temporary directories. Use local playback for design and interaction testing. Production hosting checks should use HEAD or small byte ranges, followed by one brief playback verification after a source change.

Tests verify that sound toggles issue no play/pause/load/seek operations, including before playback starts and while paused or buffering. Browser checks cover autoplay, consecutive sound taps, uninterrupted time across the desktop switch, navigation and keyboard controls. Mobile-sized Chromium checks do not establish physical iPhone Safari behavior.

`/mobile-preview` embeds the actual site at 390 × 844 on desktop and redirects phones to `/#video`. It is a layout preview, not iPhone Safari emulation. No diagnostic link, reporting endpoint or playback visibility gate is shipped.

## Releases

Vercel builds the static `dist` directory. The build fingerprints HTML, styles and the complete module graph into `/releases/<hash>/`, so every page loads one consistent release. Relative imports stay within that release. `/release.json` and the `strikeout-release` HTML meta identify the deployment. Fingerprinted assets are immutable; the release manifest is never cached.

Only public-facing brand assets and the movie poster are in this repository. Store exports, theme backups and the original movie are not published here.
