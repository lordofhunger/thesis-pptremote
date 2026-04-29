/**
 * PRESETS.JS
 *
 * Defines widget metadata and manages presets stored server-side.
 * Each preset stores layout, thumbnailSize, and theme.
 * On first load, if the server has no presets, the built-in ones are seeded.
 */

const WIDGET_DEFS = {
    preview:          { name: 'Slide Preview',          color: '#1b9e77', desc: 'Live preview of the current slide. Tap to click through, drag with pen selected to draw.' },
    notes:            { name: 'Speaker Notes',          color: '#d95f02', desc: 'Shows the speaker notes for the current slide.' },
    thumbs:           { name: 'Thumbnail Grid',         color: '#7570b3', desc: 'All slide thumbnails, tap one to jump to that slide.' },
    nextpreview:      { name: 'Next Slide Preview',     color: '#66c2a5', desc: 'Preview of the next slide.' },
    prevpreview:      { name: 'Previous Slide Preview', color: '#3288bd', desc: 'Preview of the previous slide.' },
    prev:             { name: 'Previous',               color: '#e7298a', desc: 'Go to the previous slide.' },
    next:             { name: 'Next',                   color: '#f781bf', desc: 'Go to the next slide.' },
    nav:              { name: 'Prev / Next',            color: '#e7298a', desc: 'Previous and next slide buttons together.' },
    counter:          { name: 'Slide Counter',          color: '#66a61e', desc: 'Shows current slide number and total.' },
    tools:            { name: 'Annotation Tools',       color: '#e6ab02', desc: 'Pen, laser, eraser and arrow mode buttons.' },
    toolspenerase:    { name: 'Pen + Eraser',           color: '#ffd92f', desc: 'Switch between pen drawing mode and eraser.' },
    toolslaserarrow:  { name: 'Laser + Arrow',          color: '#e5c494', desc: 'Switch between laser pointer and normal arrow.' },
    pen:              { name: 'Pen',                    color: '#a6d854', desc: 'Activate pen drawing mode.' },
    laser:            { name: 'Laser',                  color: '#fc8d62', desc: 'Activate laser pointer mode.' },
    arrow:            { name: 'Arrow',                  color: '#8da0cb', desc: 'Activate normal arrow/click mode.' },
    prevgoto:         { name: 'Previous (goto)',        color: '#71c469', desc: 'Go to previous slide using goto, will not go through animations.' },
    nextgoto:         { name: 'Next (goto)',            color: '#5c0a36', desc: 'Go to next slide using goto, will not go through animations.' },
    navgoto:          { name: 'Prev! / Next!',          color: '#1800a1', desc: 'Previous and next using goto together.' },
    //videocontrols:    { name: 'Video Controls',         color: '#2c3e50', desc: 'Play/pause video.' },
    animnext:         { name: 'Next Animation',         color: '#2980b9', desc: 'Fire next animation on current slide only, does not advance slide.' },
    animprev:         { name: 'Previous Animation',     color: '#2980b9', desc: 'Fire previous animation on current slide only.' },
    animnav:          { name: 'Anim Prev / Next',       color: '#2980b9', desc: 'Previous and next animation buttons together.' },
    first:            { name: 'First Slide',            color: '#8e44ad', desc: 'Jump to the first slide.' },
    last:             { name: 'Last Slide',             color: '#8e44ad', desc: 'Jump to the last slide.' },
    clear:            { name: 'Clear Annotations',      color: '#c0392b', desc: 'Wipes all drawn annotations from the current slide.' },
    whiteboard:       { name: 'Whiteboard',             color: '#16a085', desc: 'Go to first whiteboard slide, or create one.' },
    pencolors:        { name: 'Pen Colours',            color: '#e74c3c', desc: 'Colours.' },
};

// Built-in preset templates used to seed the server on first run.
const BUILTIN_PRESETS = {
    phone: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'prev',            col: 1,  row: 1, w: 2,  h: 1 },
            { id: 'next',            col: 3,  row: 1, w: 2,  h: 1 },
            { id: 'counter',         col: 5,  row: 1, w: 2,  h: 1 },
            { id: 'toolspenerase',   col: 8,  row: 1, w: 2,  h: 1 },
            { id: 'toolslaserarrow', col: 10, row: 1, w: 2,  h: 1 },
            { id: 'prevpreview',     col: 1,  row: 2, w: 4,  h: 3 },
            { id: 'preview',         col: 5,  row: 2, w: 4,  h: 3 },
            { id: 'nextpreview',     col: 9,  row: 2, w: 4,  h: 3 },
            { id: 'notes',           col: 1,  row: 5, w: 12, h: 4 },
        ]
    },
    phonePortrait: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'counter',         col: 1,  row: 1, w: 12, h: 1 },
            { id: 'preview',         col: 1,  row: 2, w: 12, h: 3 },
            { id: 'notes',           col: 1,  row: 5, w: 12, h: 2 },
            { id: 'prev',            col: 1,  row: 7, w: 6,  h: 1 },
            { id: 'next',            col: 7,  row: 7, w: 6,  h: 1 },
            { id: 'toolspenerase',   col: 1,  row: 8, w: 6,  h: 1 },
            { id: 'toolslaserarrow', col: 7,  row: 8, w: 6,  h: 1 },
        ]
    },
    tablet: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'preview', col: 1, row: 1, w: 8, h: 5 },
            { id: 'notes',   col: 1, row: 6, w: 8, h: 3 },
            { id: 'nav',     col: 9, row: 1, w: 4, h: 1 },
            { id: 'counter', col: 9, row: 2, w: 4, h: 1 },
            { id: 'tools',   col: 9, row: 3, w: 4, h: 2 },
            { id: 'thumbs',  col: 9, row: 5, w: 4, h: 4 },
        ]
    },
    desktop: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'preview', col: 1, row: 1, w: 7, h: 5 },
            { id: 'notes',   col: 1, row: 6, w: 7, h: 3 },
            { id: 'nav',     col: 8, row: 1, w: 5, h: 1 },
            { id: 'counter', col: 8, row: 2, w: 5, h: 1 },
            { id: 'tools',   col: 8, row: 3, w: 5, h: 1 },
            { id: 'thumbs',  col: 8, row: 4, w: 5, h: 5 },
        ]
    },
    presenter: {
        thumbSize: 80,
        theme: 'dark',
        layout: [
            { id: 'preview', col: 1, row: 1, w: 10, h: 7 },
            { id: 'nav',     col: 1, row: 8, w: 5,  h: 1 },
            { id: 'counter', col: 6, row: 8, w: 3,  h: 1 },
            { id: 'tools',   col: 9, row: 8, w: 4,  h: 1 },
        ]
    },
    minimalRemote: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'counter', col: 1,  row: 1, w: 12, h: 1 },
            { id: 'prev',    col: 1,  row: 2, w: 6,  h: 2 },
            { id: 'next',    col: 7,  row: 2, w: 6,  h: 2 },
            { id: 'notes',   col: 1,  row: 5, w: 12, h: 4 },
        ]
    },
    previewFocused: {
        thumbSize: 80,
        theme: 'light',
        layout: [
            { id: 'preview',     col: 1, row: 1, w: 12, h: 5 },
            { id: 'prevpreview', col: 1, row: 6, w: 6,  h: 1 },
            { id: 'nextpreview', col: 7, row: 6, w: 6,  h: 1 },
            { id: 'prevgoto',    col: 1, row: 7, w: 6,  h: 1 },
            { id: 'nextgoto',    col: 7, row: 7, w: 6,  h: 1 },
            { id: 'counter',     col: 1, row: 8, w: 12, h: 1 },
        ]
    },
};

// All presets loaded from the server, keyed by name.
let serverPresets = {};

async function loadServerPresets() {
    try {
        serverPresets = await fetch('/presets').then(r => r.json());
    } catch {
        serverPresets = {};
    }

    // If the server returned nothing, seed with the built-ins and save them.
    if (Object.keys(serverPresets).length === 0) {
        serverPresets = JSON.parse(JSON.stringify(BUILTIN_PRESETS));
        await saveServerPresets();
    }
}

async function saveServerPresets() {
    try {
        await fetch('/presets', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(serverPresets)
        });
    } catch {}
}

async function saveCurrentAsPreset(name) {
    const theme     = document.body.classList.contains('dark') ? 'dark' : 'light';
    const thumbSize = parseInt(localStorage.getItem('thumbSize') || '80');
    serverPresets[name] = { layout: layout.map(p => ({ ...p })), thumbSize, theme };
    await saveServerPresets();
    renderPresetButtons();
}

async function deletePreset(name) {
    delete serverPresets[name];
    await saveServerPresets();
    renderPresetButtons();
}

function renderPresetButtons() {
    const row = document.getElementById('preset-row');
    if (!row) return;
    row.innerHTML = '';

    for (const name of Object.keys(serverPresets)) {
        const btn = document.createElement('button');
        btn.className   = 'preset-btn';
        btn.textContent = name;
        btn.onclick     = () => applyPreset(name);
        row.appendChild(btn);
    }

    const addBtn = document.createElement('button');
    addBtn.className   = 'preset-btn preset-btn-add';
    addBtn.textContent = '+';
    addBtn.title       = 'Save current layout as new preset';
    addBtn.onclick     = async () => {
        const name = prompt('Name for this preset:')?.trim();
        if (!name) return;
        await saveCurrentAsPreset(name);
    };
    row.appendChild(addBtn);
}

function defaultPreset() {
    const w = window.innerWidth;
    if (w < 600)  return 'phone';
    if (w < 1024) return 'tablet';
    return 'desktop';
}