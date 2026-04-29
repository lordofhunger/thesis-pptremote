/**
 * VIDEO.JS
 *
 * Simple play/pause toggle for videos embedded in slides.
 * Clicking the video shape toggles playback via the addin.
 */

let _videoPlaying = false;

async function videoToggle() {
    const resp = await fetch('/video/toggle').then(r => r.text());
    console.log('[video] toggle:', resp);
    if (resp === 'OK') {
        _videoPlaying = !_videoPlaying;
        const btn = document.getElementById('video-playpause-btn');
        if (btn) btn.textContent = _videoPlaying ? '⏸ Pause' : '▶ Play';
    }
}

// Reset state when slide changes
function onSlideChangeVideo() {
    _videoPlaying = false;
    const btn = document.getElementById('video-playpause-btn');
    if (btn) btn.textContent = '▶ Play';
}