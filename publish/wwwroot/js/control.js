/**
 * CONTROL.JS
 *
 * On page load, tries to claim control if nobody has it yet.
 * Polls every 3 seconds to keep the UI in sync.
 * The take control widget lets anyone forcibly claim control.
 */

let _inControl = false;

// Called on load — silently claims control if the slot is free.
async function initControl() {
    try {
        const resp = await fetch('/control/claim').then(r => r.text());
        _inControl = resp === 'yes';
        updateControlUI();
    } catch {}
}

async function checkControl() {
    try {
        const resp = await fetch('/control/status').then(r => r.text());
        _inControl = resp === 'yes';
        updateControlUI();
    } catch {}
}

async function takeControl() {
    await fetch('/control/take');
    _inControl = true;
    updateControlUI();
}

function updateControlUI() {
    const btn = document.getElementById('take-control-btn');
    if (btn) {
        btn.textContent = _inControl ? '✔ In Control' : '⚡ Take Control';
    }

    // Dim all action buttons when not in control so the user knows they cant act.
    document.querySelectorAll('.btn').forEach(b => {
        if (b.id === 'take-control-btn') return;
        b.style.opacity = _inControl ? '' : '0.4';
    });
}

initControl();
setInterval(checkControl, 3000);