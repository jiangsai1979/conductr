// Conductr - Playback Engine (Tone.js 4-Track Synthesizer)

import { EventEmitter } from './utils.js';
import { TRACKS, DEFAULT_BPM } from './config.js';

export class PlaybackEngine extends EventEmitter {
  constructor() {
    super();
    this.isPlaying = false;
    this.isLooping = false;
    this.bpm = DEFAULT_BPM;
    this.synths = {};
    this.parts = {};
    this.volumes = {};
    this.muted = {};
    this._initialized = false;
    this._arrangement = null;
    this._totalBars = 4;
  }

  async init() {
    if (this._initialized) return;
    const Tone = window.Tone;
    if (!Tone) throw new Error('Tone.js not loaded');

    await Tone.start();
    Tone.Transport.bpm.value = this.bpm;

    // Create volume nodes for each track
    TRACKS.forEach(t => {
      this.volumes[t.id] = new Tone.Volume(0).toDestination();
      this.muted[t.id] = false;
    });

    // Bass: MonoSynth with sawtooth wave
    this.synths.bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.4 },
      filterEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.4, baseFrequency: 100, octaves: 2 },
    }).connect(this.volumes.bass);

    // Drums: Multiple synths for different drum sounds
    this.synths.drums = {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 6, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
      }).connect(this.volumes.drums),

      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
      }).connect(this.volumes.drums),

      hihat: new Tone.MetalSynth({
        frequency: 400, envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      }).connect(this.volumes.drums),

      openhat: new Tone.MetalSynth({
        frequency: 400, envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      }).connect(this.volumes.drums),

      clap: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
      }).connect(this.volumes.drums),

      tom: new Tone.MembraneSynth({
        pitchDecay: 0.08, octaves: 4, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 },
      }).connect(this.volumes.drums),
    };

    // Harmony: PolySynth with FM synthesis (warm pad sound)
    this.synths.harmony = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1, modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.8 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.5, decay: 0.2, sustain: 0.5, release: 0.5 },
    }).connect(this.volumes.harmony);
    this.synths.harmony.maxPolyphony = 8;

    // Melody: PolySynth with triangle wave (clear lead)
    this.synths.melody = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.3 },
    }).connect(this.volumes.melody);
    this.synths.melody.maxPolyphony = 4;

    this._initialized = true;
  }

  /**
   * Load an arrangement JSON into the transport
   */
  loadArrangement(arrangement, numBars) {
    this.stop();
    this._arrangement = arrangement;
    this._totalBars = numBars || 4;

    const Tone = window.Tone;

    // Dispose old parts
    Object.values(this.parts).forEach(p => p?.dispose());
    this.parts = {};

    // Bass part
    if (arrangement.bass?.length) {
      this.parts.bass = new Tone.Part((time, event) => {
        if (this.muted.bass) return;
        this.synths.bass.triggerAttackRelease(event.note, event.duration, time);
        this.emit('trackTrigger', 'bass');
      }, arrangement.bass.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' })));
    }

    // Drums part
    if (arrangement.drums?.length) {
      this.parts.drums = new Tone.Part((time, event) => {
        if (this.muted.drums) return;
        const drum = this.synths.drums[event.note];
        if (drum) {
          if (drum instanceof Tone.NoiseSynth) {
            drum.triggerAttackRelease(event.duration || '16n', time);
          } else if (drum instanceof Tone.MetalSynth) {
            drum.triggerAttackRelease(400, event.duration || '32n', time);
          } else {
            drum.triggerAttackRelease(event.note === 'tom' ? 'G2' : 'C1', event.duration || '8n', time);
          }
          this.emit('trackTrigger', 'drums');
        }
      }, arrangement.drums.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' })));
    }

    // Harmony part (chords - array of notes)
    if (arrangement.harmony?.length) {
      this.parts.harmony = new Tone.Part((time, event) => {
        if (this.muted.harmony) return;
        const notes = event.notes || [event.note];
        this.synths.harmony.triggerAttackRelease(notes, event.duration || '2n', time);
        this.emit('trackTrigger', 'harmony');
      }, arrangement.harmony.map(e => ({
        time: e.time,
        notes: e.notes || [e.note],
        duration: e.duration || '2n',
      })));
    }

    // Melody part
    if (arrangement.melody?.length) {
      this.parts.melody = new Tone.Part((time, event) => {
        if (this.muted.melody) return;
        this.synths.melody.triggerAttackRelease(event.note, event.duration || '8n', time);
        this.emit('trackTrigger', 'melody');
      }, arrangement.melody.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' })));
    }

    // Configure all parts
    const loopEnd = `${this._totalBars}:0:0`;
    Object.values(this.parts).forEach(part => {
      if (part) {
        part.loop = this.isLooping;
        part.loopEnd = loopEnd;
      }
    });

    Tone.Transport.loop = this.isLooping;
    Tone.Transport.loopEnd = loopEnd;

    this.emit('arrangementLoaded');
  }

  async play() {
    await this.init();
    const Tone = window.Tone;

    // Start all parts
    Object.values(this.parts).forEach(p => p?.start(0));
    Tone.Transport.start();

    this.isPlaying = true;
    this.emit('playStateChanged', true);

    // Track position for UI
    this._posInterval = setInterval(() => {
      if (this.isPlaying) {
        this.emit('position', Tone.Transport.position);
      }
    }, 100);
  }

  stop() {
    const Tone = window.Tone;
    if (!Tone) return;

    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Object.values(this.parts).forEach(p => p?.stop());

    this.isPlaying = false;
    clearInterval(this._posInterval);
    this.emit('playStateChanged', false);
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    const Tone = window.Tone;
    if (Tone) {
      Tone.Transport.loop = this.isLooping;
      Object.values(this.parts).forEach(p => {
        if (p) p.loop = this.isLooping;
      });
    }
    this.emit('loopChanged', this.isLooping);
  }

  hasArrangement() {
    return this._arrangement !== null;
  }

  setVolume(trackId, db) {
    if (this.volumes[trackId]) {
      this.volumes[trackId].volume.value = db;
    }
  }

  toggleMute(trackId) {
    this.muted[trackId] = !this.muted[trackId];
    if (this.volumes[trackId]) {
      this.volumes[trackId].mute = this.muted[trackId];
    }
    this.emit('muteChanged', trackId, this.muted[trackId]);
    return this.muted[trackId];
  }

  setBpm(bpm) {
    this.bpm = bpm;
    const Tone = window.Tone;
    if (Tone) {
      Tone.Transport.bpm.value = bpm;
    }
  }

  /**
   * Render arrangement offline to a WAV Blob for download
   */
  async renderToWav() {
    if (!this._arrangement) throw new Error('No arrangement loaded');
    const Tone = window.Tone;

    // Calculate duration in seconds: bars * beats_per_bar * seconds_per_beat + tail
    const duration = (this._totalBars * 4 * 60) / this.bpm + 1.5;

    const arrangement = this._arrangement;
    const bpm = this.bpm;

    const buffer = await Tone.Offline(({ transport }) => {
      transport.bpm.value = bpm;

      // ── Recreate synths in offline context ──
      const bass = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.4 },
        filterEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.4, baseFrequency: 100, octaves: 2 },
      }).toDestination();

      const drums = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05, octaves: 6, oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
        }).toDestination(),
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        }).toDestination(),
        hihat: new Tone.MetalSynth({
          frequency: 400, envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
          harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
        }).toDestination(),
        openhat: new Tone.MetalSynth({
          frequency: 400, envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
          harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
        }).toDestination(),
        clap: new Tone.NoiseSynth({
          noise: { type: 'pink' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
        }).toDestination(),
        tom: new Tone.MembraneSynth({
          pitchDecay: 0.08, octaves: 4, oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 },
        }).toDestination(),
      };

      const harmony = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 1, modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.5, decay: 0.2, sustain: 0.5, release: 0.5 },
      }).toDestination();
      harmony.maxPolyphony = 8;

      const melody = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.3 },
      }).toDestination();
      melody.maxPolyphony = 4;

      // ── Schedule parts ──
      if (arrangement.bass?.length) {
        new Tone.Part((time, e) => {
          bass.triggerAttackRelease(e.note, e.duration, time);
        }, arrangement.bass.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' }))).start(0);
      }
      if (arrangement.drums?.length) {
        new Tone.Part((time, e) => {
          const d = drums[e.note];
          if (!d) return;
          if (d instanceof Tone.NoiseSynth) d.triggerAttackRelease(e.duration || '16n', time);
          else if (d instanceof Tone.MetalSynth) d.triggerAttackRelease(400, e.duration || '32n', time);
          else d.triggerAttackRelease(e.note === 'tom' ? 'G2' : 'C1', e.duration || '8n', time);
        }, arrangement.drums.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' }))).start(0);
      }
      if (arrangement.harmony?.length) {
        new Tone.Part((time, e) => {
          harmony.triggerAttackRelease(e.notes, e.duration, time);
        }, arrangement.harmony.map(e => ({ time: e.time, notes: e.notes || [e.note], duration: e.duration || '2n' }))).start(0);
      }
      if (arrangement.melody?.length) {
        new Tone.Part((time, e) => {
          melody.triggerAttackRelease(e.note, e.duration, time);
        }, arrangement.melody.map(e => ({ time: e.time, note: e.note, duration: e.duration || '8n' }))).start(0);
      }

      transport.start();
    }, duration);

    // Convert ToneAudioBuffer → WAV Blob
    return this._audioBufferToWav(buffer.get());
  }

  _audioBufferToWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, length, true);

    const channels = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channels.push(audioBuffer.getChannelData(ch));
    }

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Play a single preview note on the melody synth
   */
  async playPreviewNote(note) {
    await this.init();
    this.synths.melody.triggerAttackRelease(note, '8n');
  }

  dispose() {
    this.stop();
    Object.values(this.synths).forEach(s => {
      if (s && typeof s.dispose === 'function') s.dispose();
      else if (s && typeof s === 'object') {
        Object.values(s).forEach(sub => sub?.dispose?.());
      }
    });
    Object.values(this.volumes).forEach(v => v?.dispose?.());
    Object.values(this.parts).forEach(p => p?.dispose?.());
  }
}
