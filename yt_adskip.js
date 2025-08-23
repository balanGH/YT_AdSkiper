/**
 * Script to automatically detect and remove YouTube ads and popups such as the "My Ad Center" dialog.
 * 
 * Features:
 * - Detects video ads and attempts to skip or block them automatically.
 * - Removes popups like the "My Ad Center" dialog by clicking dismiss buttons and removing overlays.
 * - Automatically resumes video playback if interrupted by ads or popups.
 * - Adjusts video playback speed and volume to quickly skip ads.
 * - Removes various on-page ad elements from YouTube UI.
 * - Logs debug messages if enabled.
 * 
 * New addition:
 * - Retrieves and logs the z-index CSS property of the "My Ad Center" popup dialog (`tp-yt-paper-dialog` element)
 *   to help debug popup layering issues or confirm if the popup is present and visible.
 */

(function() {
    const adblocker = true;
    const removePopup = false;
    const debugMessages = true;

    let currentUrl = window.location.href;
    let isAdFound = false;
    let adLoop = 0;

    log("Script started");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();

    // Function to get the z-index of the "My Ad Center" popup dialog
    function getPopupZIndex() {
        const popup = document.querySelector('tp-yt-paper-dialog[aria-label="My Ad Center"]');
        if (popup) {
            // Get computed style of the popup element and extract the z-index value
            return window.getComputedStyle(popup).zIndex;
        }
        return null; // Return null if popup not found
    }

    function popupRemover() {
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector("tp-yt-paper-dialog[aria-label='My Ad Center']");
            const popupButton = document.getElementById("dismiss-button");
            var video = document.querySelector('video');

            // Make sure body can scroll again if popup tried to block scrolling
            document.body.style.setProperty('overflow-y', 'auto', 'important');

            // Remove modal overlay if present
            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                log("Popup detected, removing...");

                // Log the z-index of the popup for debugging purposes
                const zIndex = getPopupZIndex();
                log(`Popup z-index is: ${zIndex}`);

                if (popupButton) popupButton.click();
                popup.remove();

                // Try to resume video playback after removing popup
                video.play();
                setTimeout(() => video.play(), 500);

                log("Popup removed");
            }

            // If video is paused for some reason, play it
            if (video && video.paused) video.play();

        }, 1000);
    }

    function removeAds() {
        log("removeAds()");

        var videoPlayback = 1;

        setInterval(() => {
            var video = document.querySelector('video');
            const ad = [...document.querySelectorAll('.ad-showing')][0];

            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad) {
                isAdFound = true;
                adLoop++;

                if (adLoop < 10) {
                    const openAdCenterButton = document.querySelector('.ytp-ad-button-icon');
                    openAdCenterButton?.click();

                    const blockAdButton = document.querySelector('[label="Block ad"]');
                    blockAdButton?.click();

                    const blockAdButtonConfirm = document.querySelector('.Eddif [label="CONTINUE"] button');
                    blockAdButtonConfirm?.click();

                    const closeAdCenterButton = document.querySelector('.zBmRhe-Bz112c');
                    closeAdCenterButton?.click();
                } else {
                    if (video) video.play();
                }

                var popupContainer = document.querySelector('body > ytd-app > ytd-popup-container > tp-yt-paper-dialog');
                if (popupContainer && popupContainer.style.display === "") {
                    popupContainer.style.display = 'none';
                }

                log("Found Ad");

                const skipButtons = [
                    'ytp-ad-skip-button-container',
                    'ytp-ad-skip-button-modern',
                    '.videoAdUiSkipButton',
                    '.ytp-ad-skip-button',
                    '.ytp-ad-skip-button-modern',
                    '.ytp-ad-skip-button-slot'
                ];

                if (video) {
                    video.playbackRate = 10;
                    video.volume = 0;

                    skipButtons.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => element?.click());
                    });

                    video.play();
                    let randomNumber = Math.random() * (0.5 - 0.1) + 0.1;
                    video.currentTime = video.duration + randomNumber || 0;
                }

                log("skipped Ad (✔️)");

            } else {
                if (video && video.playbackRate === 10) {
                    video.playbackRate = videoPlayback;
                }

                if (isAdFound) {
                    isAdFound = false;

                    if (videoPlayback === 10) videoPlayback = 1;
                    if (video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;

                    adLoop = 0;
                } else {
                    if (video) videoPlayback = video.playbackRate;
                }
            }
        }, 50);

        removePageAds();
    }

    function removePageAds() {
        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const style = document.createElement('style');

        style.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            yt-mealbar-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background,
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad,
            tp-yt-iron-overlay-backdrop,
            #masthead-ad {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        sponsor?.forEach(element => {
            if (element.getAttribute("id") === "rendering-content") {
                element.childNodes?.forEach(childElement => {
                    if (childElement?.data.targetId && childElement?.data.targetId !== "engagement-panel-macro-markers-description-chapters") {
                        element.style.display = 'none';
                    }
                });
            }
        });

        log("Removed page ads (✔️)");
    }

    // Logging helper function
    function log(message, level = 'l', ...args) {
        if (!debugMessages) return;

        const prefix = 'Remove Adblock Thing:';
        const fullMessage = `${prefix} ${message}`;

        switch (level) {
            case 'e':
            case 'err':
            case 'error':
                console.error(fullMessage, ...args);
                break;
            case 'l':
            case 'log':
                console.log(fullMessage, ...args);
                break;
            case 'w':
            case 'warn':
            case 'warning':
                console.warn(fullMessage, ...args);
                break;
            case 'i':
            case 'info':
            default:
                console.info(fullMessage, ...args);
                break;
        }
    }
})();
