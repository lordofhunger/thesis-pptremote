let isDrawing  = false;
let currentMode = 'pen';

// The local overlay canvas context, set when the preview is built.
let _overlayCtx = null;
let _lastLocalX = null;
let _lastLocalY = null;

function setCurrentMode(mode) {
    currentMode = mode.toString();
}

// Called by poll.js on slide change to wipe the local overlay.
function clearLocalCanvas() {
    if (_overlayCtx) {
        _overlayCtx.clearRect(0, 0, _overlayCtx.canvas.width, _overlayCtx.canvas.height);
    }
}

function attachDrawListeners(img) {
    // Create an overlay canvas that sits on top of the preview image.
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; width:100%; height:100%;';

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;';
    wrapper.appendChild(canvas);

    // Keep canvas pixel size in sync with its display size.
    function resizeCanvas() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    new ResizeObserver(resizeCanvas).observe(canvas);

    const ctx = canvas.getContext('2d');
    _overlayCtx = ctx;

    img.style.touchAction = 'none';
    img.draggable = false;

    const MOVE_THRESHOLD = 0.01;
    let lastX = null;
    let lastY = null;

    img.addEventListener('pointerdown', e => {
        e.preventDefault();
        img.setPointerCapture(e.pointerId);
        isDrawing = true;
        const rect = img.getBoundingClientRect();
        lastX = (e.clientX - rect.left) / rect.width;
        lastY = (e.clientY - rect.top)  / rect.height;
        _lastLocalX = e.clientX - rect.left;
        _lastLocalY = e.clientY - rect.top;
        send(e, 'down');
    });

    img.addEventListener('pointermove', e => {
        if (!isDrawing) return;
        const rect = img.getBoundingClientRect();
        const x  = (e.clientX - rect.left) / rect.width;
        const y  = (e.clientY - rect.top)  / rect.height;
        const dx = x - lastX;
        const dy = y - lastY;

        if (Math.sqrt(dx * dx + dy * dy) < MOVE_THRESHOLD) return;

        // Draw locally on the canvas
        if (currentMode === 'pen' && _lastLocalX !== null) {
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            // Scale normalized coords to canvas pixels
            const scaleX = canvas.width  / rect.width;
            const scaleY = canvas.height / rect.height;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth   = 2;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            ctx.moveTo(_lastLocalX * scaleX, _lastLocalY * scaleY);
            ctx.lineTo(localX     * scaleX, localY      * scaleY);
            ctx.stroke();
            _lastLocalX = localX;
            _lastLocalY = localY;
        } else if (currentMode === 'erase') {
            // For erase we just clear a small area locally as an approximation
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            const scaleX = canvas.width  / rect.width;
            const scaleY = canvas.height / rect.height;
            ctx.clearRect(localX * scaleX - 10, localY * scaleY - 10, 20, 20);
            _lastLocalX = localX;
            _lastLocalY = localY;
        }

        if (currentMode === 'pen' || currentMode === 'erase') {
            send(e, 'down');
        } else {
            send(e, 'move');
        }

        lastX = x;
        lastY = y;
    });

    img.addEventListener('pointerup', e => {
        send(e, 'up');
        isDrawing   = false;
        lastX       = null;
        lastY       = null;
        _lastLocalX = null;
        _lastLocalY = null;
        img.releasePointerCapture(e.pointerId);
    });

    img.addEventListener('pointercancel', () => {
        isDrawing   = false;
        lastX       = null;
        lastY       = null;
        _lastLocalX = null;
        _lastLocalY = null;
    });
}

function send(e, type) {
    const img  = e.target;
    const rect = img.getBoundingClientRect();
    const x    = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y    = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    fetch('/click', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ x, y, type })
    }).catch(() => {});
}