// Conductr - Virtual Piano Keyboard Component

import { PIANO_NOTES, KEY_MAP, NOTE_KEY_MAP } from './config.js';
import { isBlackKey, displayNote, EventEmitter } from './utils.js';

export class PianoKeyboard extends EventEmitter {
  constructor(container) {
    super();
    this.container = container;
    this.activeNotes = new Set();   // keyboard held notes (temporary)
    this.lockedNotes = new Set();   // mouse toggled notes (persistent)
    this._keyDownHandler = this._onKeyDown.bind(this);
    this._keyUpHandler = this._onKeyUp.bind(this);
    this.render();
    this._bindEvents();
  }

  render() {
    this.container.replaceChildren();
    this.container.className = 'piano-keyboard';

    const keysWrapper = document.createElement('div');
    keysWrapper.className = 'piano-keys';

    PIANO_NOTES.forEach(note => {
      const key = document.createElement('div');
      const black = isBlackKey(note);
      key.className = `piano-key ${black ? 'black' : 'white'}`;
      key.dataset.note = note;

      // Label: show the computer key mapping
      const label = document.createElement('span');
      label.className = 'key-label';
      const computerKey = NOTE_KEY_MAP[note];
      label.textContent = computerKey ? computerKey.toUpperCase() : '';
      key.appendChild(label);

      // Note name label
      if (!black) {
        const noteLbl = document.createElement('span');
        noteLbl.className = 'note-label';
        noteLbl.textContent = displayNote(note);
        key.appendChild(noteLbl);
      }

      // Mouse: click toggles lock state
      key.addEventListener('click', (e) => {
        e.preventDefault();
        this._toggleNote(note);
      });

      keysWrapper.appendChild(key);
    });

    this.container.appendChild(keysWrapper);
  }

  _bindEvents() {
    document.addEventListener('keydown', this._keyDownHandler);
    document.addEventListener('keyup', this._keyUpHandler);
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.repeat) return;

    const note = KEY_MAP[e.key.toLowerCase()];
    if (note) {
      e.preventDefault();
      this._noteOn(note);
    }
  }

  _onKeyUp(e) {
    const note = KEY_MAP[e.key.toLowerCase()];
    if (note) {
      this._noteOff(note);
    }
  }

  _noteOn(note) {
    if (this.activeNotes.has(note) || this.lockedNotes.has(note)) return;
    this.activeNotes.add(note);
    this._setKeyActive(note, true);
    this.emit('noteOn', note);
  }

  _noteOff(note) {
    if (!this.activeNotes.has(note)) return;
    this.activeNotes.delete(note);
    // If note is locked by mouse, keep it active — don't notify ChordEngine
    if (this.lockedNotes.has(note)) return;
    this._setKeyActive(note, false);
    this.emit('noteOff', note);
  }

  _toggleNote(note) {
    if (this.lockedNotes.has(note)) {
      this.lockedNotes.delete(note);
      // Only deactivate visual if keyboard isn't also holding it
      if (!this.activeNotes.has(note)) {
        this._setKeyActive(note, false);
      }
      this.emit('noteOff', note);
    } else {
      this.lockedNotes.add(note);
      this._setKeyActive(note, true);
      this.emit('noteOn', note);
    }
  }

  clearLockedNotes() {
    const notes = [...this.lockedNotes];
    this.lockedNotes.clear();
    notes.forEach(note => {
      if (!this.activeNotes.has(note)) {
        this._setKeyActive(note, false);
      }
      this.emit('noteOff', note);
    });
  }

  _setKeyActive(note, active) {
    const el = this.container.querySelector(`[data-note="${note}"]`);
    if (el) {
      el.classList.toggle('active', active);
    }
  }

  getActiveNotes() {
    return [...new Set([...this.activeNotes, ...this.lockedNotes])].sort();
  }

  destroy() {
    document.removeEventListener('keydown', this._keyDownHandler);
    document.removeEventListener('keyup', this._keyUpHandler);
  }
}
