// Conductr - Utility Functions

/**
 * Check if a note name is a sharp/flat (black key)
 */
export function isBlackKey(note) {
  return note.includes('#');
}

/**
 * Get the display name for a note (e.g., C#4 → C♯4)
 */
export function displayNote(note) {
  return note.replace('#', '♯');
}

/**
 * Strip octave from note name (e.g., C#4 → C#)
 */
export function noteName(note) {
  return note.replace(/\d+$/, '');
}

/**
 * Get octave from note name (e.g., C#4 → 4)
 */
export function noteOctave(note) {
  const match = note.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 4;
}

/**
 * Debounce a function
 */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Simple event emitter
 */
export class EventEmitter {
  constructor() {
    this._handlers = {};
  }

  on(event, handler) {
    (this._handlers[event] ||= []).push(handler);
    return this;
  }

  off(event, handler) {
    const list = this._handlers[event];
    if (list) {
      this._handlers[event] = list.filter(h => h !== handler);
    }
    return this;
  }

  emit(event, ...args) {
    (this._handlers[event] || []).forEach(h => h(...args));
  }
}
