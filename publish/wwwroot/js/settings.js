/**
* SETTINGS.JS
* 
* Manages the layout editor panel: opening, closing, rendering the mini grid etc.
*/

// widget currently selected for placement.
let pendingWidget = null;

// chosen coordinate cell for pending widget.
let pendingCell   = null;

// Panel opening and closing.
function openSettings() {
  document.getElementById('settings').classList.add('open');
  document.body.classList.add('edit-mode');

  const savedSize = localStorage.getItem('thumbSize') || '80';
  const slider = document.getElementById('global-thumb-slider');
  const valDisplay = document.getElementById('global-thumb-val');
  
  slider.value = savedSize;
  valDisplay.textContent = savedSize;

  renderEditorGrid();
  renderPalette();
}

// Handle the slider input
document.getElementById('global-thumb-slider').oninput = function() {
    const newSize = this.value;

    document.getElementById('global-thumb-val').textContent = newSize;

    localStorage.setItem('thumbSize', newSize);

    updateThumbnailGridStyles(newSize);

    syncCurrentPresetToServer();
};

document.getElementById('delete-preset-btn')?.addEventListener('click', async () => {
    const name = prompt('Name of preset to delete:')?.trim();
    if (!name) return;
    if (!serverPresets[name]) { alert(`No preset named "${name}".`); return; }
    if (!confirm(`Delete preset "${name}"?`)) return;
    await deletePreset(name);
});

/**
 * Helper to update the grid styles without a full re-render
 */
function updateThumbnailGridStyles(size) {
    const thumbsBody = document.querySelector('#w-thumbs .widget-body');
    if (thumbsBody) {
        // Set the width for the auto-fill columns
        thumbsBody.style.setProperty('--thumb-w', size + 'px');
    }
}


function closeSettings() {
  document.getElementById('settings').classList.remove('open');
  document.body.classList.remove('edit-mode');
  hideSizePicker();
}

document.getElementById('gear-btn').onclick = openSettings;
document.getElementById('close-btn').onclick = closeSettings;

/**
* Builds the mini editor grid in the settings panel, widget cells are coloured using @see WIDGET_DEFS colours.
* Top left cell is brighter than the rest because it is the coordinate cell.
*/
function renderEditorGrid() {
  const grid = document.getElementById('editor-grid');
  grid.innerHTML = '';
  
  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 12; c++) {
      const cell = document.createElement('div');
      cell.className = 'editor-cell';
      cell.dataset.col = c;
      cell.dataset.row = r;
      
      // find which widget occupies this cell.
      const owner = layout.find(item =>
        c >= item.col && c < item.col + item.w &&
        r >= item.row && r < item.row + item.h
      );
      
      if (owner) {
        const def = WIDGET_DEFS[owner.id];
        const isOrigin = (c === owner.col && r === owner.row);
        cell.style.background = def.color + (isOrigin ? '66' : '33');
      }
      
      cell.onclick = () => onCellClick(parseInt(cell.dataset.col), parseInt(cell.dataset.row));
      grid.appendChild(cell);
    }
  }
}


/**
 * Called when user clicks a cell in the editor grid, if any widget is pending, 
 * this cell is recorded as its origin and the size picker is shown.
 */
function onCellClick(col, row) {
  if (!pendingWidget) return;
  pendingCell = { col, row };
  
  // clamps slider extremae so widget cant extend past the grid.
  const sw = document.getElementById('span-w');
  const sh = document.getElementById('span-h');
  sw.max = 13 - col;
  sh.max = 9  - row;
  sw.value = Math.min(parseInt(sw.value), sw.max);
  sh.value = Math.min(parseInt(sh.value), sh.max);
  document.getElementById('span-w-val').textContent = sw.value;
  document.getElementById('span-h-val').textContent = sh.value;
  
  document.getElementById('size-picker').classList.add('visible');
  highlightEditorCells(col, row, parseInt(sw.value), parseInt(sh.value));
}

/**
 * Highlights editor cells that would be covered by a widget placed at 
 * the origin (col, row) with width width and heigh height.
 */
function highlightEditorCells(col, row, w, h) {
  document.querySelectorAll('.editor-cell').forEach(cell => {
    const c = parseInt(cell.dataset.col);
    const r = parseInt(cell.dataset.row);
    cell.classList.toggle('highlight', c >= col && c < col + w && r >= row && r < row + h);
  });
}

// Updates highlight previews based on user input
document.getElementById('span-w').oninput = function () {
  document.getElementById('span-w-val').textContent = this.value;
  if (pendingCell)
    highlightEditorCells(pendingCell.col, pendingCell.row,
    parseInt(this.value), parseInt(document.getElementById('span-h').value));
  };
  
  document.getElementById('span-h').oninput = function () {
    document.getElementById('span-h-val').textContent = this.value;
    if (pendingCell)
      highlightEditorCells(pendingCell.col, pendingCell.row,
      parseInt(document.getElementById('span-w').value), parseInt(this.value));
    };


    // confirms placement and adds widget to layout.
    document.getElementById('place-btn').onclick = () => {
      if (!pendingWidget || !pendingCell) return;
      
      const w = parseInt(document.getElementById('span-w').value);
      const h = parseInt(document.getElementById('span-h').value);
      
      // ensure no duplicate widgets
      layout = layout.filter(item => item.id !== pendingWidget);
      layout.push({ id: pendingWidget, col: pendingCell.col, row: pendingCell.row, w, h });
      
      saveLayout();
      renderCanvas();
      renderEditorGrid();
      renderPalette();
      hideSizePicker();

      pendingWidget = null;
      pendingCell   = null;
    };
    
    // hides size picker and clears the cell highlight
    function hideSizePicker() {
      document.getElementById('size-picker').classList.remove('visible');
      document.querySelectorAll('.editor-cell').forEach(c => c.classList.remove('highlight'));
    }
    
    /**
     * builds the widget palette in the serttings panel, each placed widget has its position,
     * on widget click it gets selected for placement or deselected.
     */
    function renderPalette() {
      const palette = document.getElementById('palette');
      palette.innerHTML = '';
      
      for (const [id, def] of Object.entries(WIDGET_DEFS)) {
        const placed = layout.find(item => item.id === id);
        
        const item = document.createElement('div');
        item.className = 'palette-item' + (pendingWidget === id ? ' selected' : '');
        
        // coloured dot matching editor grid colour for this widget.
        const dot = document.createElement('div');
        dot.className = 'palette-dot';
        dot.style.background = def.color;
        
        const info = document.createElement('div');
        info.className = 'palette-info';
        info.innerHTML = `<div class="palette-name">${def.name}</div>
        <div class="palette-pos">${placed
          ? `col ${placed.col} / row ${placed.row} / ${placed.w}×${placed.h}`
          : 'not placed'}</div>
        ${def.desc ? `<div class="palette-desc">${def.desc}</div>` : ''}`;
        
        item.appendChild(dot);
        item.appendChild(info);
        
        // remove button appears if widget is currently placed
        if (placed) {
          const rem = document.createElement('button');
          rem.className = 'palette-remove';
          rem.title = 'Remove';
          rem.textContent = '✕';
          rem.onclick = (e) => {
            e.stopPropagation();
            layout = layout.filter(l => l.id !== id);
            saveLayout();
            renderCanvas();
            renderEditorGrid();
            renderPalette();
          };
          item.appendChild(rem);
        }
        
        item.onclick = () => {
          // on reclicking a widget it gets deselected.
          pendingWidget = (pendingWidget === id) ? null : id;
          pendingCell = null;
          hideSizePicker();
          document.getElementById('placing-name').textContent =
          pendingWidget ? WIDGET_DEFS[pendingWidget].name : '';
          renderPalette();
        };
        
        palette.appendChild(item);
      }
    }