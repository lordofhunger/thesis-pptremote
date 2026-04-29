/**
* WIDGET-BUILDERS.JS
*
* One build function per type of widget, each function receives an (empty) body div and
* populates it with that which the body requires, procedure names match their keys in {@link WIDGET_DEFS}.
*/

/** 
* Renders current slide preview image, refreshed with @see pollSlide on slide change. 
*/
function buildPreview(body) {
    const img = document.createElement('img');
    img.id = 'preview-img';
    img.src = '/preview?ts=' + Date.now();
    img.alt = 'Slide preview';
    img.draggable = false;
    img.style.userSelect = 'none';
    img.style.touchAction = 'none';
    /*
    img.addEventListener('pointerup', function(e) {
        const rect = img.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top)  / rect.height;
        console.log('sending click', x.toFixed(3), y.toFixed(3));
        fetch('/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: x, y: y }),
        }).then(function(r) { return r.text(); })
        .then(function(t) { console.log('server responded:', t); })
        .catch(function(err) { console.error('fetch failed:', err); });
    });
    */
    body.appendChild(img);
    attachDrawListeners(img);
}

/**
* Renders speaker notes area, text also updated with @see pollSlide on slide change.
*/
function buildNotes(body) {
    body.id = 'notes-body';
    body.textContent = 'Notes will appear here…';
}

/**
* Renders the thumbnail grid, thumbnails are fetched immediately using @see loadThumbs,
* which also populates the @see slideCount in state.js.
*/
function buildThumbs(body) {
    body.id = 'thumbs-body';

    const savedSize =
        parseInt(localStorage.getItem('thumbSize') || '80');

    body.style.setProperty('--thumb-w', savedSize + 'px');

    loadThumbs(body);
}

function buildNextPreview(body) {
    const img = document.createElement('img');
    img.id = 'next-preview';
    img.style.backgroundColor = 'black';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    body.appendChild(img);
}

function buildPrevPreview(body) {
    const img = document.createElement('img');
    img.id = 'prev-preview';
    img.style.backgroundColor = 'black';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    body.appendChild(img);
}


/**
* Renders the Previous and Next navigation buttons.
*/
function buildPrev(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = '◀ Prev';
    btn.onclick = () => fetch('/prev');
    body.appendChild(btn);
}

function buildNext(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Next ▶';
    btn.onclick = () => fetch('/next');
    body.appendChild(btn);
}

function buildNav(body) {
    buildPrev(body);
    buildNext(body);
}

/**
* Renders a "<current> / <total>" slide counter, updated with @see pollSlide.
*/
function buildCounter(body) {
    const span = document.createElement('span');
    span.id = 'counter-span';
    span.textContent = '? / ?';
    body.appendChild(span);
}

/**
* Renders Pen, Laser*, and Eraser mode buttons. (*: Laser button is currently not functional).
*/
function makeToolButton(label, mode) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = label;
    btn.onclick = () => {
        fetch('/mode/' + mode);
        setCurrentMode(mode);
    };
    return btn;
}

function buildTools(body) {
    body.append(
        makeToolButton('Pen', 'pen'),
        makeToolButton('Laser', 'laser'),
        makeToolButton('Eraser', 'erase'),
        makeToolButton('Arrow', 'arrow')
    );
}

function buildToolsPenErase(body) {
    body.append(
        makeToolButton('Pen', 'pen'),
        makeToolButton('Eraser', 'erase')
    );
}

function buildToolsLaserArrow(body) {
    body.append(
        makeToolButton('Laser', 'laser'),
        makeToolButton('Arrow', 'arrow')
    );
}

function buildPen(body) {
    body.append(makeToolButton('Pen', 'pen'));
}

function buildLaser(body) {
    body.append(makeToolButton('Laser', 'laser'));
}

function buildArrow(body) {
    body.append(makeToolButton('Arrow', 'arrow'));
}

function buildPrevGoto(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = '◀ Prev!';
    btn.onclick = () => {
        const curr = parseInt(lastSlide);
        if (curr > 1) fetch('/goto/' + (curr - 1));
    };
    body.appendChild(btn);
}

function buildNextGoto(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Next! ▶';
    btn.onclick = () => {
        const curr = parseInt(lastSlide);
        if (curr < slideCount) fetch('/goto/' + (curr + 1));
    };
    body.appendChild(btn);
}

function buildNavGoto(body) {
    buildPrevGoto(body);
    buildNextGoto(body);
}

function buildVideoControls(body) {
    const ppBtn = document.createElement('button');
    ppBtn.className = 'btn';
    ppBtn.id        = 'video-playpause-btn';
    ppBtn.textContent = '▶ Play';
    ppBtn.onclick   = () => videoToggle();

    body.append(ppBtn);
    _updateUI();
}

function buildAnimNext(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Next v';
    btn.onclick = () => fetch('/anim/next');
    body.appendChild(btn);
}

function buildAnimPrev(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Prev ^';
    btn.onclick = () => fetch('/anim/prev');
    body.appendChild(btn);
}

function buildAnimNav(body) {
    buildAnimPrev(body);
    buildAnimNext(body);
}

function buildFirst(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = '|◀ First';
    btn.onclick = () => fetch('/first');
    body.appendChild(btn);
}

function buildLast(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Last ▶|';
    btn.onclick = () => fetch('/last');
    body.appendChild(btn);
}

function buildClear(body) {
    const btn = document.createElement('button');
    btn.className = 'btn icon-btn';
    btn.textContent = 'Clear';
    btn.onclick = () => {
        fetch('/clear');
        clearLocalCanvas();
    };
    body.appendChild(btn);
}

function buildWhiteboard(body) {
    const gotoBtn = document.createElement('button');
    gotoBtn.className   = 'btn icon-btn';
    gotoBtn.textContent = 'goto whiteboard';
    gotoBtn.onclick     = () => fetch('/whiteboardgoto');

    const addBtn = document.createElement('button');
    addBtn.className   = 'btn icon-btn';
    addBtn.textContent = '+ New WB';
    addBtn.onclick     = () => fetch('/whiteboardadd');

    body.append(gotoBtn, addBtn);
}

function buildPenColors(body) {
    const presets = [
        { name: 'black', hex: '000000' },
        { name: 'red',   hex: 'FF0000' },
        { name: 'green', hex: '00FF00' },
        { name: 'blue',  hex: '0000FF' }
    ];

    presets.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'btn color-swatch'; // Use a specific class
        btn.style.backgroundColor = '#' + color.hex;
        btn.onclick = () => fetch(`/pencolor?hex=${color.hex}`);
        body.appendChild(btn);
    });

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'color-picker-input';
    picker.onchange = () => {
        const hex = picker.value.substring(1);
        fetch(`/pencolor?hex=${hex}`);
    };
    body.appendChild(picker);
}

/**
* Maps widget IDs to their build functions, unlisted IDs get skipped in @see renderCanvas
*/
const WIDGET_BUILDERS = { 
    preview: buildPreview, 
    notes: buildNotes, 
    thumbs: buildThumbs,
    nextpreview: buildNextPreview,
    prevpreview: buildPrevPreview,
    prev: buildPrev,
    next: buildNext,
    nav: buildNav, 
    counter: buildCounter, 
    toolspenerase: buildToolsPenErase,
    toolslaserarrow: buildToolsLaserArrow,
    pen: buildPen,
    laser: buildLaser,
    arrow: buildArrow,
    tools: buildTools,
    prevgoto: buildPrevGoto,
    nextgoto: buildNextGoto,
    navgoto:  buildNavGoto,
    //videocontrols: buildVideoControls,
    animnext: buildAnimNext,
    animprev: buildAnimPrev,
    animnav:  buildAnimNav,
    first: buildFirst,
    last:  buildLast,
    clear: buildClear,
    whiteboard: buildWhiteboard,
    pencolors: buildPenColors 
};