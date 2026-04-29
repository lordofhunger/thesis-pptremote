/**
 * WIDGET-RENDER.JS
 * 
 * Handles rendering the current widget layout of the remote,
 * as well as keeping the thumbnail state synced with the active slide.
 */


function renderCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    
    for (const item of layout) {
        const def = WIDGET_DEFS[item.id];
        const builder = WIDGET_BUILDERS[item.id];

        if (!def || !builder) {
            console.warn('Unknown ID in layout:', item.id);
            return;
        };
        
        const el = document.createElement('div');
        el.className = 'widget';
        el.id = 'w-' + item.id;
        el.style.gridColumn = `${item.col} / span ${item.w}`;
        el.style.gridRow    = `${item.row} / span ${item.h}`;
        
        // header is only shown in edit mode through css.
        const header = document.createElement('div');
        header.className = 'widget-header';
        header.textContent = def.name;
        el.appendChild(header);
        
        const body = document.createElement('div');
        body.className = 'widget-body';
        builder(body);
        el.appendChild(body);
        
        canvas.appendChild(el);
    }
    const savedSize =
        parseInt(localStorage.getItem('thumbSize') || '80');

    updateThumbnailGridStyles(savedSize);
}

/**
 * Fetches slide thumbnails from server and populates corresponding widget, 
 * also updates shared slideCount variable used by counter widget.
 */
async function loadThumbs(body) {
    try {
        const count = await fetch('/slidecount').then(r => r.text());

        // this updates the slidecount variable for the counter widget.
        slideCount = count;

        // if no body was passed we still try to find it.
        if (!body) body = document.getElementById('thumbs-body');
        if (!body) return;

        body.innerHTML = '';

        for (let i = 1; i <= parseInt(count); i++) {
            const img         = document.createElement('img');
            img.className     = 'thumb-img';
            img.src           = `/thumb/${i}`;
            img.title         = 'Slide ' + i;
            img.dataset.slide = i;
            img.onclick       = () => fetch('/goto/' + i);
            body.appendChild(img);
        }
    } catch {}
}

/**
 * Used to show which slide has been selected by adding the .active class
 * to the currently displayed slide thumbnail and removing it from the rest.
 */
function highlightThumb(slide) {
    document.querySelectorAll('.thumb-img').forEach(img => {
        img.classList.toggle('active', img.dataset.slide === slide);
    });
}