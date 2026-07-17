# YT_AdSkiper

A lightweight userscript that automatically detects and skips YouTube video ads, and removes on-page ad elements and popups such as the **"My Ad Center"** dialog.

## Features

- **Auto-skips video ads** — detects the `.ad-showing` state, mutes the ad, maxes out playback speed, clicks any skip button, and seeks past the ad.
- **Removes "My Ad Center" popups** — dismisses the dialog and its modal overlay, then resumes playback.
- **Hides the enforcement dialog** — pushes the anti-adblock `<tp-yt-paper-dialog>` behind the page by forcing a negative `z-index` (optional).
- **Strips static page ads** — injects a stylesheet that hides masthead ads, promoted renderers, in-feed ad slots, and other ad UI, and re-runs on every navigation.
- **Restores your playback speed** after each ad, so speeding up an ad doesn't stick.
- **Debug logging** — toggleable console output prefixed with `Remove Adblock Thing:`.

## Installation

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Create a new script and paste in the contents of [`yt_adskip.js`](yt_adskip.js).
3. Save and reload YouTube.

Alternatively, paste the script into the browser DevTools console for a one-off run on the current tab.

## Configuration

Flags live at the top of the IIFE in [`yt_adskip.js`](yt_adskip.js):

| Flag | Default | Description |
|------|---------|-------------|
| `adblocker` | `true` | Enables video-ad skipping and page-ad removal. |
| `removePopup` | `false` | Enables the "My Ad Center" / enforcement popup remover. |
| `debugMessages` | `true` | Logs debug output to the console. |

## How it works

- `removeAds()` polls every 50ms for an active ad, mutes and fast-forwards it, clicks skip buttons, and seeks to the end of the ad clip. It also restores your normal playback rate once the ad ends.
- `popupRemover()` polls every 1s for the "My Ad Center" dialog and modal overlay, dismisses them, and resumes the video.
- `removePageAds()` injects a one-time stylesheet (guarded by an element id so it isn't duplicated on navigation) and hides dynamically loaded ad panels.

## Disclaimer

This project is for educational purposes only. Selectors and YouTube's ad delivery change frequently, so behavior may break without notice. Use at your own discretion and in accordance with YouTube's Terms of Service.
