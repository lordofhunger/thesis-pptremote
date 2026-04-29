/**
 * STATE.JS
 * 
 * Holds the shared mutable state for the remote tool's UI.
 * These are directly used in other modules.
 */

// Current layout: array of { id, col, row, w, h }.
let layout    = [];

// Last seen slide number as a string, e.g. "4" -> null if none has been received yet.
let lastSlide = null;

// Amount of slides, kept as string to match what server returns.
let slideCount = '?';

/**
 * Keeps current layout in localStorage, fails silently when unavailable.
 */
function saveLayout() {
  try { 
    localStorage.setItem('ppt-layout', JSON.stringify(layout)); 
  } catch (err){
    console.warn('Could not save layout to localStorage:', err);
  }
}

/**
 * Reads previously saved layout from localStorage, returns array or null if nothing stored.
 */
function loadSavedLayout() {
  try {
    const saved = localStorage.getItem('ppt-layout');
    if (saved) return JSON.parse(saved);
  } catch (err){
    console.warn('Unable to read layout from LocalStorage:', err)
  }
  return null;
}