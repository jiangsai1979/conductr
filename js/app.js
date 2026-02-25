// Conductr - Main Application Controller

import { API_CONFIG, STYLES, KEYS, DEFAULT_BPM, TRACKS } from './config.js';
import { PianoKeyboard } from './piano-keyboard.js';
import { ChordEngine } from './chord-engine.js';
import { generateArrangement } from './ai-arranger.js';
import { PlaybackEngine } from './playback-engine.js';
import { displayNote } from './utils.js';

class App {
  constructor() {
    this.piano = null;
    this.chordEngine = new ChordEngine();
    this.playback = new PlaybackEngine();
    this.currentStyle = 'pop';
    this.currentKey = 'C';
    this.currentBpm = DEFAULT_BPM;
    this.isGenerating = false;

    this._loadSettings();
    this._initUI();
    this._bindModules();
  }

  // ── UI Initialization ──────────────────────────

  _initUI() {
    // Populate dropdowns
    this._populateSelect('style-select', STYLES.map(s => ({ value: s.id, label: s.name })));
    this._populateSelect('key-select', KEYS.map(k => ({ value: k, label: k })));

    // Set defaults
    document.getElementById('style-select').value = this.currentStyle;
    document.getElementById('key-select').value = this.currentKey;
    document.getElementById('bpm-input').value = this.currentBpm;

    // Init piano
    this.piano = new PianoKeyboard(document.getElementById('piano-container'));

    // Build mixer tracks
    this._buildMixer();

    // Event listeners for controls
    document.getElementById('style-select').addEventListener('change', e => {
      this.currentStyle = e.target.value;
    });
    document.getElementById('key-select').addEventListener('change', e => {
      this.currentKey = e.target.value;
    });
    document.getElementById('bpm-input').addEventListener('change', e => {
      this.currentBpm = Math.max(60, Math.min(200, parseInt(e.target.value) || DEFAULT_BPM));
      e.target.value = this.currentBpm;
      this.playback.setBpm(this.currentBpm);
    });

    // Chord bar buttons
    document.getElementById('btn-add-chord').addEventListener('click', () => this._addChord());
    document.getElementById('btn-clear-chords').addEventListener('click', () => {
      this.chordEngine.clearProgression();
    });
    document.getElementById('btn-clear-selection').addEventListener('click', () => {
      this.piano.clearLockedNotes();
    });
    document.getElementById('btn-generate').addEventListener('click', () => this._generate());
    document.getElementById('btn-download').addEventListener('click', () => this._download());

    // Transport controls
    document.getElementById('btn-play').addEventListener('click', () => this._togglePlay());
    document.getElementById('btn-stop').addEventListener('click', () => this.playback.stop());
    document.getElementById('btn-loop').addEventListener('click', () => this.playback.toggleLoop());

    // Settings modal
    document.getElementById('btn-settings').addEventListener('click', () => this._openSettings());
    document.getElementById('btn-save-settings').addEventListener('click', () => this._saveSettings());
    document.getElementById('btn-cancel-settings').addEventListener('click', () => this._closeSettings());
    document.getElementById('settings-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._closeSettings();
    });

    // Keyboard shortcut: Space = play/stop
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this._togglePlay();
      }
      // Enter = add chord
      if (e.code === 'Enter') {
        e.preventDefault();
        this._addChord();
      }
    });
  }

  _populateSelect(id, options) {
    const sel = document.getElementById(id);
    sel.replaceChildren();
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      sel.appendChild(o);
    });
  }

  _buildMixer() {
    const container = document.getElementById('mixer-tracks');
    container.replaceChildren();

    TRACKS.forEach(track => {
      const row = document.createElement('div');
      row.className = 'mixer-track';
      row.dataset.track = track.id;

      // Track indicator (activity light)
      const indicator = document.createElement('div');
      indicator.className = 'track-indicator';
      indicator.style.setProperty('--track-color', track.color);

      // Track label
      const label = document.createElement('div');
      label.className = 'track-label';
      label.textContent = `${track.icon} ${track.name}`;

      // Volume slider
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'track-volume';
      slider.min = '-30';
      slider.max = '6';
      slider.value = '0';
      slider.step = '1';
      slider.addEventListener('input', (e) => {
        this.playback.setVolume(track.id, parseInt(e.target.value));
      });

      // Mute button
      const muteBtn = document.createElement('button');
      muteBtn.className = 'btn-mute';
      muteBtn.textContent = 'M';
      muteBtn.title = 'Mute';
      muteBtn.addEventListener('click', () => {
        const muted = this.playback.toggleMute(track.id);
        muteBtn.classList.toggle('muted', muted);
      });

      row.appendChild(indicator);
      row.appendChild(label);
      row.appendChild(slider);
      row.appendChild(muteBtn);
      container.appendChild(row);
    });
  }

  // ── Module Wiring ──────────────────────────────

  _bindModules() {
    // Piano → ChordEngine + preview sound
    this.piano.on('noteOn', (note) => {
      this.chordEngine.noteOn(note);
      this.playback.playPreviewNote(note);
    });
    this.piano.on('noteOff', (note) => {
      this.chordEngine.noteOff(note);
    });

    // ChordEngine → UI
    this.chordEngine.on('chordDetected', (chord) => {
      this._updateChordDisplay(chord);
    });
    this.chordEngine.on('progressionChanged', (prog) => {
      this._renderProgression(prog);
    });

    // Playback → UI
    this.playback.on('playStateChanged', (playing) => {
      document.getElementById('btn-play').textContent = playing ? '⏸' : '▶';
      document.getElementById('btn-play').classList.toggle('playing', playing);
    });
    this.playback.on('loopChanged', (looping) => {
      document.getElementById('btn-loop').classList.toggle('active', looping);
    });
    this.playback.on('trackTrigger', (trackId) => {
      this._flashTrack(trackId);
    });
    this.playback.on('position', (pos) => {
      document.getElementById('position-display').textContent = pos.split('.')[0];
    });
  }

  // ── Chord Management ───────────────────────────

  _addChord() {
    const added = this.chordEngine.addCurrentChord();
    if (!added) {
      // If no chord detected, show hint
      this._showStatus('Click piano keys to select notes (click again to deselect), or hold keyboard keys together');
    }
  }

  _updateChordDisplay(chord) {
    const el = document.getElementById('current-chord');
    if (chord) {
      el.textContent = displayNote(chord);
      el.classList.add('detected');
    } else {
      el.textContent = '—';
      el.classList.remove('detected');
    }
  }

  _renderProgression(progression) {
    const container = document.getElementById('chord-progression');
    container.replaceChildren();

    if (progression.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty-hint';
      empty.textContent = 'Click piano keys to build a chord, then press Enter or + Add';
      container.appendChild(empty);
      return;
    }

    progression.forEach((chord, i) => {
      const chip = document.createElement('div');
      chip.className = 'chord-chip';

      const name = document.createElement('span');
      name.textContent = displayNote(chord);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'chip-remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.chordEngine.removeChord(i);
      });

      chip.appendChild(name);
      chip.appendChild(removeBtn);
      container.appendChild(chip);
    });

    // Update generate button state
    const genBtn = document.getElementById('btn-generate');
    genBtn.disabled = progression.length === 0;
  }

  // ── AI Generation ──────────────────────────────

  async _generate() {
    if (this.isGenerating) return;

    const chords = this.chordEngine.getProgression();
    if (chords.length === 0) {
      this._showStatus('Add chords first!');
      return;
    }

    this.isGenerating = true;
    const btn = document.getElementById('btn-generate');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    this._showStatus('Asking AI to arrange your chord progression...');

    try {
      const arrangement = await generateArrangement(
        chords, this.currentStyle, this.currentKey, this.currentBpm
      );

      this.playback.setBpm(this.currentBpm);
      this.playback.loadArrangement(arrangement, chords.length);
      this._showStatus(`Generated ${chords.length}-bar arrangement! Press Play ▶`);
      document.getElementById('btn-download').disabled = false;

      // Auto-play
      await this.playback.play();
    } catch (err) {
      console.error('Generation error:', err);
      this._showStatus(`Error: ${err.message}`);
    } finally {
      this.isGenerating = false;
      btn.disabled = false;
      btn.textContent = '✨ Generate';
    }
  }

  // ── Download ─────────────────────────────────

  async _download() {
    const btn = document.getElementById('btn-download');
    btn.disabled = true;
    btn.textContent = 'Rendering...';
    this._showStatus('Rendering WAV file...');

    try {
      const blob = await this.playback.renderToWav();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conductr-${this.currentStyle}-${this.currentKey}-${this.currentBpm}bpm.wav`;
      a.click();
      URL.revokeObjectURL(url);
      this._showStatus('WAV downloaded!');
    } catch (err) {
      console.error('Download error:', err);
      this._showStatus(`Download error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '⬇ Download WAV';
    }
  }

  // ── Transport ──────────────────────────────────

  async _togglePlay() {
    if (this.playback.isPlaying) {
      this.playback.stop();
    } else {
      if (!this.playback.hasArrangement()) {
        this._showStatus('Generate an arrangement first!');
        return;
      }
      await this.playback.play();
    }
  }

  // ── Settings ───────────────────────────────────

  _openSettings() {
    document.getElementById('settings-endpoint').value = API_CONFIG.endpoint;
    document.getElementById('settings-apikey').value = API_CONFIG.apiKey;
    document.getElementById('settings-model').value = API_CONFIG.model;
    document.getElementById('settings-overlay').classList.add('visible');
  }

  _saveSettings() {
    API_CONFIG.endpoint = document.getElementById('settings-endpoint').value.trim();
    API_CONFIG.apiKey = document.getElementById('settings-apikey').value.trim();
    API_CONFIG.model = document.getElementById('settings-model').value.trim();

    // Save to localStorage
    localStorage.setItem('conductr_endpoint', API_CONFIG.endpoint);
    localStorage.setItem('conductr_apikey', API_CONFIG.apiKey);
    localStorage.setItem('conductr_model', API_CONFIG.model);

    this._closeSettings();
    this._showStatus('Settings saved');
  }

  _closeSettings() {
    document.getElementById('settings-overlay').classList.remove('visible');
  }

  _loadSettings() {
    const endpoint = localStorage.getItem('conductr_endpoint');
    const apikey = localStorage.getItem('conductr_apikey');
    const model = localStorage.getItem('conductr_model');
    if (endpoint) API_CONFIG.endpoint = endpoint;
    if (apikey) API_CONFIG.apiKey = apikey;
    if (model) API_CONFIG.model = model;
  }

  // ── UI Helpers ─────────────────────────────────

  _flashTrack(trackId) {
    const indicator = document.querySelector(`.mixer-track[data-track="${trackId}"] .track-indicator`);
    if (indicator) {
      indicator.classList.add('active');
      setTimeout(() => indicator.classList.remove('active'), 100);
    }
  }

  _showStatus(msg) {
    const el = document.getElementById('status-bar');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._statusTimer);
    this._statusTimer = setTimeout(() => el.classList.remove('show'), 5000);
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.__app = new App();
});
