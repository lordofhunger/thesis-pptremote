function buildPreview(body) {
  const img = document.createElement('img');
  img.id = 'preview-img';
  img.src = '/preview?ts=' + Date.now();
  img.alt = 'Slide preview';
  body.appendChild(img);
}

function buildNotes(body) {
  body.id = 'notes-body';
  body.textContent = 'Notes will appear here…';
}

function buildThumbs(body) {
  body.id = 'thumbs-body';
  loadThumbs(body);
}

function buildNav(body) {
  const prev = document.createElement('button');
  prev.className = 'btn icon-btn';
  prev.textContent = '◀ Prev';
  prev.onclick = () => fetch('/prev');

  const next = document.createElement('button');
  next.className = 'btn icon-btn';
  next.textContent = 'Next ▶';
  next.onclick = () => fetch('/next');

  body.appendChild(prev);
  body.appendChild(next);
}

function buildCounter(body) {
  const span = document.createElement('span');
  span.id = 'counter-span';
  span.textContent = '? / ?';
  body.appendChild(span);
}

function buildTools(body) {
  [['Pen', 'pen'], ['Laser', 'laser'], ['Eraser', 'erase']].forEach(([label, mode]) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = label;
    btn.onclick = () => fetch('/mode/' + mode);
    body.appendChild(btn);
  });
}

const WIDGET_BUILDERS = { preview: buildPreview, notes: buildNotes, thumbs: buildThumbs,
                           nav: buildNav, counter: buildCounter, tools: buildTools };

function renderCanvas() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';

  for (const item of layout) {
    const def = WIDGET_DEFS[item.id];
    if (!def) continue;

    const el = document.createElement('div');
    el.className = 'widget';
    el.id = 'w-' + item.id;
    el.style.gridColumn = `${item.col} / span ${item.w}`;
    el.style.gridRow    = `${item.row} / span ${item.h}`;

    const header = document.createElement('div');
    header.className = 'widget-header';
    header.textContent = def.name;
    el.appendChild(header);

    const body = document.createElement('div');
    body.className = 'widget-body';
    WIDGET_BUILDERS[item.id](body);
    el.appendChild(body);

    canvas.appendChild(el);
  }
}

async function loadThumbs(body) {
  try {
    const count = await fetch('/slidecount').then(r => r.text());
    slideCount = count;
    if (!body) body = document.getElementById('thumbs-body');
    if (!body) return;
    body.innerHTML = '';
    for (let i = 1; i <= parseInt(count); i++) {
      const img = document.createElement('img');
      img.className = 'thumb-img';
      img.src = `/thumb/${i}`;
      img.title = 'Slide ' + i;
      img.dataset.slide = i;
      img.onclick = () => fetch('/goto/' + i);
      body.appendChild(img);
    }
  } catch {}
}

function highlightThumb(slide) {
  document.querySelectorAll('.thumb-img').forEach(img => {
    img.classList.toggle('active', img.dataset.slide === slide);
  });
}