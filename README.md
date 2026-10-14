# Strikeout

First responsive design, using the original Strikeout sky photograph and S artwork from the preserved theme. No site header.

- The homepage opens with the stationary S. One click enters the film, which starts automatically muted; no separate play click is needed. The small top-center S returns to the entrance. Direct `/#video` visits also autoplay muted. The entrance was restored after the user clarified that it must remain.
- Desktop: a wordless switch at the bottom center changes between the smaller film and the five catalog rows.
- Mobile (760px and below): logo, horizontal 16:9 film and all five catalog rows form one centered group. Film and catalog share the available width with 16px side gutters and safe-area padding; short screens scroll naturally. Desktop keeps the original fixed sky image. Mobile uses a document-sized image with `object-fit: cover` and 160px of sky above and below the content. Initial entry and internal navigation align the content with the viewport, leaving real image content beyond both edges instead of ending the image at a fixed layer. The document stays scrollable; safe-area padding applies only to content. The player code is unchanged from the user-confirmed autoplay restoration. Physical iPhone toolbar rendering is not locally verified.
- Catalog labels match the saved Strikeout theme: `articulat-cf`, weight 900, normal letter spacing and weight synthesis allowed. The separate `articulat-heavy-cf` face was rejected by the user and is not used. Fonts are served by the existing Adobe kit.
- Mobile has no toggle; film and catalog stay visible in one stacked layout.
- No site controls draw white focus boxes. Tap/click focus has no outline or shadow; keyboard focus uses logo opacity, catalog color/underlines and small line indicators on the film and switch. Buttons explicitly disable native appearance. The desktop phone preview also uses the sky without a pale surround or preview header.
- Studios, Dopo, Formal, Catalog, and About have independent URLs with the top S and a back arrow. Page content is intentionally pending.
- Film playback is restored from fe05434, before the sound-on change: native muted autoplay with inline playback and no native controls, including direct visits. The film view has no fade, so the player is visible from its first frame. Click/tap the playing film (or use the focused button with Enter/Space) to toggle sound. Switching to the desktop catalog resets sound to off and pauses; returning resumes the same film muted, without attempting audible autoplay. Navigation destroys the old player. Delayed playback events cannot resume a hidden film, and stale play rejections cannot change the current playback state.
- Desktop Space toggles film sound whenever the film view is active. Held keys do not repeat the action; links, buttons, form fields, modified shortcuts and mobile layouts retain their normal keyboard behavior.
- The direct film has no visible title, byline or player branding. Its accessible title remains. No YouTube player or SDK loads for an MP4/WebM. The original movie's embedded still serves as its loading poster. Sound toggling while playing never resends a play command.
- If browser/device settings block even muted autoplay, the poster and a play action remain; tapping retries with sound. Player errors provide a link to watch the film. There is no pause button or timeline.
- The web copy keeps the supplied master’s 1920 × 1080 resolution and 24000/1001 frame rate. Its ProRes picture is encoded as H.264 (CRF 16, slow preset, 8-bit 4:2:0) with AAC stereo audio at 320 kb/s and MP4 fast-start metadata. This is a high-quality web conversion, not a lossless copy of the 10-bit ProRes master. The single MP4 has no automatic resolution downgrades.
- The legacy YouTube adapter remains available if a YouTube URL is configured later. Do not hide it behind a timer/playback-event visibility gate: that caused a black-screen regression. Its quality cannot be forced through supported API settings.

## Content

`content.js` contains the hosted Ghost Town film URL, accessible title, poster and optional caption. Edit it to change the film and individual page copy. YouTube, MP4 and WebM URLs are supported. An empty video URL explicitly shows “Film to come.” The original MOV and generated MP4 stay outside the Git repository; only the poster belongs in `assets`.

## Preview

No build dependencies. Run `npm run build`, then `npm run dev`. Open the printed local URL. On desktop, `/mobile-preview` embeds the actual homepage in a 390 × 844 CSS-pixel viewport, using its real media queries and navigation. On widths up to 760px it redirects to the actual `/#video` page, so phones use the full screen without a nested page. There is no forced-mobile app mode or `?layout=mobile` override. Run `npm run check` for syntax validation and `npm test` for playback lifecycle/build tests. Vercel builds the static `dist` output.

Historical browser checks for dc54e75 (before the restoration): actual homepage at 390 × 844, 375 × 667 and 320 × 568; sky covers the viewport and the short screen's scrolled area; no horizontal overflow or mobile view toggle. Video time advances while muted, tapping unmutes without pausing, desktop Space toggles sound, and the catalog pauses playback. Desktop preview's embedded viewport measures exactly 390 × 844; phone preview URLs redirect to the real homepage. These are browser viewport checks, not verification of physical iPhone Safari's native toolbars.

The unpublished on-device diagnostics were reverted at the user’s request. No report endpoint or diagnostic UI ships. Current verification is recorded in the project brief; physical iPhone Safari remains unavailable locally. The move to scrollable image content follows [WebKit’s obscured-inset clipping behavior](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp#L2522); a fixed viewport image plus a transparent root had left white toolbar regions on the user’s iPhone.

Only the two public-facing brand assets were copied from the backup. Store exports and theme backups are not part of this repository.

## Releases

The build fingerprints the HTML, styles and complete module graph into `/releases/<content-hash>/`. Every page loads its CSS and entry module from that directory, and relative imports load the same release's content/player modules. Changing a page's `?rev=` alone does not invalidate imported scripts or styles; release-specific asset URLs do. `/release.json` and the `strikeout-release` HTML meta identify the deployed build. Fingerprinted assets are immutable; the release manifest is never cached. Original root-level assets remain available for previously opened pages. Build tests verify all page references, imported modules and invalidation after a playback-only change.
