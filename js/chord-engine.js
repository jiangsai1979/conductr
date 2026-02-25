// Conductr - Chord Detection Engine

import { EventEmitter, noteName } from './utils.js';

export class ChordEngine extends EventEmitter {
  constructor() {
    super();
    this.currentNotes = new Set();
    this.chordProgression = [];
    this._detectTimer = null;
  }

  noteOn(note) {
    this.currentNotes.add(note);
    this._scheduleDetect();
  }

  noteOff(note) {
    this.currentNotes.delete(note);
    // When all notes released, finalize detection
    if (this.currentNotes.size === 0 && this._lastDetected) {
      // Chord already captured
    }
  }

  _scheduleDetect() {
    clearTimeout(this._detectTimer);
    this._detectTimer = setTimeout(() => this._detect(), 50);
  }

  _detect() {
    if (this.currentNotes.size < 2) {
      this._lastDetected = null;
      this.emit('chordDetected', null);
      return;
    }

    const noteNames = [...this.currentNotes].map(n => noteName(n));
    // Use Tonal.js for chord detection
    const Tonal = window.Tonal;
    if (!Tonal) {
      console.warn('Tonal.js not loaded');
      return;
    }

    const detected = Tonal.Chord.detect(noteNames);
    const chordName = detected.length > 0 ? detected[0] : null;

    this._lastDetected = chordName;
    this.emit('chordDetected', chordName);
  }

  addCurrentChord() {
    if (!this._lastDetected) return null;
    const chord = this._lastDetected;
    this.chordProgression.push(chord);
    this.emit('progressionChanged', [...this.chordProgression]);
    return chord;
  }

  addChord(chordName) {
    this.chordProgression.push(chordName);
    this.emit('progressionChanged', [...this.chordProgression]);
  }

  removeChord(index) {
    if (index >= 0 && index < this.chordProgression.length) {
      this.chordProgression.splice(index, 1);
      this.emit('progressionChanged', [...this.chordProgression]);
    }
  }

  clearProgression() {
    this.chordProgression = [];
    this.emit('progressionChanged', []);
  }

  getProgression() {
    return [...this.chordProgression];
  }
}
