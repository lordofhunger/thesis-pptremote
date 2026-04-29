/**
 * LAYOUT.JS
 *
 * Handles theme, applies presets, and runs the boot sequence.
 * Presets are loaded from the server so all devices share the same set.
 */

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀︎' : '☾';
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
    syncCurrentPresetToServer();
}

// Apply saved theme immediately so there is no flash of wrong theme on load.
(function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);
})();


async function syncCurrentPresetToServer() {
    if (!currentPresetName || !serverPresets[currentPresetName]) return;

    // Update the serverPresets object with current state
    serverPresets[currentPresetName].layout = layout.map(p => ({ ...p }));
    serverPresets[currentPresetName].theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    serverPresets[currentPresetName].thumbSize = parseInt(localStorage.getItem('thumbSize') || '80');

    // Push to server
    await saveServerPresets();
}

async function applyPreset(name) {
    const preset = serverPresets[name];
    if (!preset) return;

    currentPresetName = name;

    layout = preset.layout.map(p => ({ ...p }));
    saveLayout();

    if (preset.theme)     applyTheme(preset.theme);
    if (preset.thumbSize) {
        localStorage.setItem('thumbSize', preset.thumbSize);

        const slider = document.getElementById('global-thumb-slider');
        const val    = document.getElementById('global-thumb-val');

        if (slider) slider.value = preset.thumbSize;
        if (val) val.textContent = preset.thumbSize;

        // IMPORTANT — apply style update
        updateThumbnailGridStyles(preset.thumbSize);
    }

    renderCanvas();
    renderEditorGrid();
    renderPalette();
    renderPresetButtons();
}

// Boot sequence — load presets from server, then restore saved layout or pick a default.
(async function boot() {
    await loadServerPresets();
    renderPresetButtons();

    const saved = loadSavedLayout();
    if (saved && saved.length > 0) {
        layout = saved;
    } else {
        const def = defaultPreset();
        if (serverPresets[def]) {
            layout = serverPresets[def].layout.map(p => ({ ...p }));
        } else if (Object.keys(serverPresets).length > 0) {
            const first = Object.keys(serverPresets)[0];
            layout = serverPresets[first].layout.map(p => ({ ...p }));
        } else {
            layout = [];
        }
    }


    renderCanvas();
    loadThumbs();
    const savedSize = parseInt(localStorage.getItem('thumbSize') || '80');

    updateThumbnailGridStyles(savedSize);
})();

document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);